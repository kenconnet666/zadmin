# 本地 PostgreSQL 与应用接入

更新日期：2026-09-06。本机已完成真实连接与事务验证。

## 当前连接

| 项目              | 已验证状态                                                 |
| ----------------- | ---------------------------------------------------------- |
| WSL               | Debian，WSL 2，mirrored 网络                               |
| Docker            | Debian 内 Docker `26.1.5+dfsg1`，引擎可达                  |
| 主库              | 已有容器 `pg-1`，PostgreSQL 18.4，容器端口 5432            |
| 另一实例          | 已有 `pg-2`，healthy，宿主发布端口 5433；本应用未接入      |
| Windows 应用地址  | `127.0.0.1:15432`                                          |
| 应用数据库 / 角色 | `zadmin_web` / `zadmin_web`                                |
| 本地私密配置      | `apps/admin/.env.local` 中的 `DATABASE_URL`，被 Git 忽略   |
| 应用              | `pnpm --filter @zadmin/admin dev`，`http://localhost:5173` |

复用原有数据库容器和持久化目录，未重建实例。专用库及非超级用户角色是本次创建的开发资源，不能当作测试结束后的临时数据删除。原有 `zadmin` 库未修改。

随机密码仅保存于本地 `.env.local`，不得提交；`apps/admin/.env.example` 是无凭据模板。生产部署通过进程环境提供 `DATABASE_URL`，不要直接复制本地开发凭据。

## 为什么使用 15432

本机的 WSL mirrored 网络下，Windows 直连 Docker 发布的 5432/5433 超时，WSL 内访问 5432 正常；Windows 访问 WSL 自身的 SSH 也正常。使用 WSL 原生 socat 在 `127.0.0.1:15432` 转发到 `127.0.0.1:5432` 后，Postgres.js 从 Windows 成功完成数据库认证和查询。

因此安装了专用 `zadmin-postgres-bridge.service`，源文件为 `scripts/wsl-postgres-bridge.service`。服务以 systemd 分配的专用动态用户运行，仅监听本机回环地址，跟随 Debian 的 systemd 启动；没有修改全局 WSL 网络设置、防火墙或已有 PostgreSQL 容器端口。

Microsoft 记录了 mirrored 网络与 Docker 发布端口的已知问题；本机采用的转发方式以实际连通性验证为依据。[WSL 网络](https://learn.microsoft.com/en-us/windows/wsl/networking)、[mirrored 与 Docker 故障排查](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting)

## 日常启动和检查

在仓库根目录的 PowerShell 中运行：

```powershell
wsl --list --verbose
wsl -d Debian -- docker ps --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'
wsl -d Debian -- systemctl is-active zadmin-postgres-bridge.service
pnpm --filter @zadmin/admin dev
```

另一个终端可查询应用的实际健康状态：

```powershell
$snapshot = Invoke-RestMethod 'http://localhost:5173/__zadmin/health'
$snapshot.providers |
  Where-Object { $_.id -eq '@zadmin/postgres' } |
  Select-Object id, state, health
```

配置了 URL 时，Postgres provider 的健康检查会执行实际 `SELECT 1`；healthy 表示该次查询成功。未提供 URL 时模块明确处于 disabled，不创建隐式 localhost 连接；它仍可作为有意禁用的可选能力进入 Runtime，但这不表示数据库在线。

测试模式的 Admin 单例明确禁用数据库，即使开发者本地有 `.env.local`，现有插件测试也不会连接该数据库。直接调用 `createAdminHost({ postgres: { url, disabled: false } })` 可要求真实配置；`disabled: false` 且 URL 为空会报错。

## 转发服务恢复

本机 service 已安装并 enabled。若 service 文件丢失，在确认 Debian 内已有 socat 后，可从仓库源文件恢复：

```powershell
wsl -d Debian -- command -v socat
wsl -d Debian -u root -- install -m 644 /mnt/c/code/zadmin/scripts/wsl-postgres-bridge.service /etc/systemd/system/zadmin-postgres-bridge.service
wsl -d Debian -u root -- systemctl daemon-reload
wsl -d Debian -u root -- systemctl enable --now zadmin-postgres-bridge.service
```

当前原有 Compose 配置位于 WSL 的 `/home/lionheart/zadmin/.docker/docker-compose.yaml`，主库数据是 `/home/lionheart/zadmin/.docker/data/pg-1` 的持久化 bind mount。先检查已有容器再恢复服务；不要执行 `docker compose down -v`、清理这些目录或重新初始化主库。

只停止本次添加的本机转发，可使用：

```powershell
wsl -d Debian -u root -- systemctl disable --now zadmin-postgres-bridge.service
```

这会使 Windows 当前应用无法访问数据库，但不会停止 PostgreSQL 或删除数据。恢复时重新 enable/start 即可。

## 代码入口和验证范围

- `packages/postgres/src/index.ts`：Postgres.js client、Drizzle RC.4 db、连接健康、禁用状态和幂等关闭。
- `apps/admin/src/lib/server/host.ts`：通过 `$env/dynamic/private` 读取 DATABASE_URL 并注入 `createPostgresModule`；配置只存在服务端。
- `apps/admin/src/lib/server/host.spec.ts`：新增测试模式不使用本地凭据的回归断言。
- [ORM 增强调研](../architecture/drizzle-postgres-enhancement-research-2026-09-06.md)：EasyQuery/C# ORM 对比和后续设计，尚未实施的能力有明确标记。

本次验证包括真实模块连接、事务提交、嵌套 savepoint 回滚、临时表清理、连接池关闭、应用健康接口与 Auth 状态接口。未执行业务迁移，应用库目前只完成连接准备。Admin 开发服务器与转发 service 有意保留运行；验证用临时 socat 进程、临时表及独立测试连接均已结束。

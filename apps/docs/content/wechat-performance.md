# WeChat performance baseline

Measured on 2026-08-25 with fixed Taro 4.2.1 and Vite 4.5.14. Both fixtures render the same 200 keyed Text nodes and one rotation Button. Times include a complete production Taro build; three alternating rounds reduce cache-order bias.

| Renderer               |          Build samples |   Median | Output bytes (excluding maps) |
| ---------------------- | ---------------------: | -------: | ----------------------------: |
| Taro Solid             | 10189, 10969, 10989 ms | 10969 ms |                        171488 |
| Svelte custom renderer | 10959, 11169, 11528 ms | 11169 ms |                        216950 |

Svelte/Solid median ratio: **1.018x**. Provisional threshold (<=1.25x): **passed**.

The Svelte framework package prebundles the exact pinned runtime into one tree-shakeable ESM module for each dev/prod condition. The application graph fell from 246–247 to 141–142 transformed modules, without introducing a second runtime; clean-tarball acceptance still resolved one Svelte 5.56.10 instance.

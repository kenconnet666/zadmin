import ts from 'typescript';

function unwrapExpression(expression) {
	let current = expression;
	while (
		current &&
		(ts.isAsExpression(current) ||
			ts.isParenthesizedExpression(current) ||
			ts.isSatisfiesExpression(current))
	)
		current = current.expression;
	return current;
}

function propertyName(property) {
	if (!property?.name) return undefined;
	return ts.isIdentifier(property.name) ||
		ts.isStringLiteral(property.name) ||
		ts.isNumericLiteral(property.name)
		? property.name.text
		: undefined;
}

function quoteLiteral(value) {
	return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

/** Resolve RecipeVariants/SlotRecipeSelection directly from a local recipe declaration. */
export function recipeVariantEntries(typeArgument, sourceFile) {
	if (!typeArgument || !ts.isTypeQueryNode(typeArgument) || !ts.isIdentifier(typeArgument.exprName))
		return undefined;
	const recipeName = typeArgument.exprName.text;
	let initializer;
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (
				ts.isIdentifier(declaration.name) &&
				declaration.name.text === recipeName &&
				declaration.initializer
			) {
				initializer = unwrapExpression(declaration.initializer);
				break;
			}
		}
	}
	if (!initializer || !ts.isCallExpression(initializer)) return undefined;
	const recipe = initializer.arguments[0] ? unwrapExpression(initializer.arguments[0]) : undefined;
	if (!recipe || !ts.isObjectLiteralExpression(recipe)) return undefined;
	const variantsProperty = recipe.properties.find(
		(property) => propertyName(property) === 'variants' && ts.isPropertyAssignment(property)
	);
	if (!variantsProperty || !ts.isPropertyAssignment(variantsProperty)) return undefined;
	const variants = unwrapExpression(variantsProperty.initializer);
	if (!ts.isObjectLiteralExpression(variants)) return undefined;
	return variants.properties.flatMap((variantProperty) => {
		if (!ts.isPropertyAssignment(variantProperty)) return [];
		const name = propertyName(variantProperty);
		const options = unwrapExpression(variantProperty.initializer);
		if (!name || !ts.isObjectLiteralExpression(options)) return [];
		const values = options.properties.map(propertyName).filter((value) => value !== undefined);
		if (values.length === 0) return [];
		const booleanVariant =
			values.length === 2 && values.includes('false') && values.includes('true');
		return [
			{
				name,
				type: booleanVariant ? 'boolean' : [...new Set(values)].sort().map(quoteLiteral).join(' | ')
			}
		];
	});
}

const repository = require("../repositories/table-category.repository.js");

async function getAllCategories() {
  return await repository.findAll();
}

async function getAllCategoriesPaged(limit, offset) {
  const categories = await repository.findAllPaged(limit, offset);
  const total = await repository.countTotal();
  return { categories, total };
}

async function getCategoryById(id) {
  const category = await repository.findById(id);
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
}

async function createCategory(categoryData) {
  // Validar que no exista una categoría con el mismo nombre
  const existing = await repository.findByName(categoryData.name);
  if (existing) {
    throw new Error("Category with this name already exists");
  }

  // Validar precio base
  if (categoryData.base_price < 0) {
    throw new Error("Base price must be positive");
  }

  return await repository.create(categoryData);
}

async function updateCategory(id, categoryData) {
  await getCategoryById(id); // Verifica que existe

  // Validar precio base si se proporciona
  if (categoryData.base_price !== undefined && categoryData.base_price < 0) {
    throw new Error("Base price must be positive");
  }

  return await repository.update(id, categoryData);
}

async function deleteCategory(id) {
  await getCategoryById(id); // Verifica que existe
  const deleted = await repository.deleteById(id);
  if (!deleted) {
    throw new Error("Could not delete category");
  }
  return true;
}

module.exports = {
  getAllCategories,
  getAllCategoriesPaged,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

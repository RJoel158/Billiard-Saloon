const repository = require("../repositories/table-category.repository.js");

async function getAllCategories() {
  return await repository.findAll();
}

async function getCategoryById(id) {
  const category = await repository.findById(id);
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
}

async function createCategory(categoryData) {
  const existing = await repository.findByName(categoryData.name);
  if (existing) {
    throw new Error("Category with this name already exists");
  }

  if (categoryData.base_price < 0) {
    throw new Error("Base price must be positive");
  }

  return await repository.create(categoryData);
}

async function updateCategory(id, categoryData) {
  await getCategoryById(id);

  if (categoryData.base_price !== undefined && categoryData.base_price < 0) {
    throw new Error("Base price must be positive");
  }

  return await repository.update(id, categoryData);
}

async function deleteCategory(id) {
  await getCategoryById(id);
  const deleted = await repository.deleteById(id);
  if (!deleted) {
    throw new Error("Could not delete category");
  }
  return true;
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

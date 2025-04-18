import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCategories, selectFilteredCategories } from "../../reducers/categories";
import { fetchProducts, selectFilteredProducts } from "../../reducers/products";
import CategoryGrid from "../../components/CategoryGrid/CategoryGrid";
import { Loader, ProductCard, SearchBar } from "../../components";
import { ROUTES } from "../../constants/routes";
import { Category, Product } from "../../types";
import { categoryService } from "../../services/categoryService";
import styles from "./CategoryPage.module.css";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import { scrollToTop } from "../../utils/scroll";

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Используем мемоизированные селекторы вместо прямого доступа к state
  const categories = useAppSelector(selectFilteredCategories);
  const categoriesLoading = useAppSelector((state) => state.categoriesList.loading);
  const categoriesError = useAppSelector((state) => state.categoriesList.error);
  
  const products = useAppSelector(selectFilteredProducts);
  const productsLoading = useAppSelector((state) => state.productsList.loading);
  const productsError = useAppSelector((state) => state.productsList.error);
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchCategories());
      dispatch(fetchProducts());
      scrollToTop();
    }
  }, [dispatch, categoryId]);

  if (categoriesLoading || productsLoading) {
    return (
      <Container className={styles.container}>
        <Loader message="Загрузка категории и товаров..." />
      </Container>
    );
  }

  if (categoriesError || productsError) {
    return (
      <Container className={styles.container}>
        <Typography color="error">{categoriesError || productsError}</Typography>
      </Container>
    );
  }

  const currentCategory = categories.find(
    (category: Category) => category._id === categoryId
  );

  // Получаем полный путь категории
  const categoryPath = categoryService.getCategoryPath(
    categories,
    categoryId || ""
  );

  // Фильтруем только подкатегории текущей категории
  const subcategories = categories.filter(
    (category: Category) => category.parentId === categoryId
  );

  // Получаем ID всех подкатегорий (включая все уровни вложенности)
  const getAllSubcategoryIds = (parentCategoryId: string): string[] => {
    const directSubcategories = categories.filter(
      (category) => category.parentId === parentCategoryId
    );

    if (directSubcategories.length === 0) {
      return [parentCategoryId];
    }

    const allSubcategoryIds = directSubcategories.flatMap((subcat) =>
      getAllSubcategoryIds(subcat._id)
    );

    return [parentCategoryId, ...allSubcategoryIds];
  };

  // Получаем все ID категорий, включая текущую и все подкатегории
  const allCategoryIds = getAllSubcategoryIds(categoryId || "");

  // Фильтруем продукты текущей категории и всех её подкатегорий
  const categoryProducts = products.filter((product: Product) => {
    const productCategoryId =
      typeof product.category === "object" && product.category !== null
        ? product.category._id
        : product.category;

    return allCategoryIds.includes(productCategoryId);
  });

  // Фильтруем продукты по поисковому запросу
  const filteredProducts = categoryProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Container className={styles.container}>
      <Box className={styles.content}>
        <Breadcrumbs aria-label="breadcrumb" className={styles.breadcrumbs}>
          <MuiLink
            component={Link}
            to={ROUTES.HOME}
            className={styles.breadcrumbLink}
          >
            <HomeIcon style={{ marginRight: "4px", fontSize: 18 }} />
            Главная
          </MuiLink>
          <MuiLink
            component={Link}
            to={ROUTES.CATALOG}
            className={styles.breadcrumbLink}
          >
            <CategoryIcon style={{ marginRight: "4px", fontSize: 18 }} />
            Каталог
          </MuiLink>
          {categoryPath.map((category, index) => {
            const isLast = index === categoryPath.length - 1;
            return isLast ? (
              <Typography
                key={category._id}
                className={styles.breadcrumbActive}
              >
                {category.name}
              </Typography>
            ) : (
              <MuiLink
                key={category._id}
                component={Link}
                to={`${ROUTES.CATEGORY.replace(":categoryId", category._id)}`}
                className={styles.breadcrumbLink}
              >
                {category.name}
              </MuiLink>
            );
          })}
        </Breadcrumbs>

        {currentCategory && currentCategory.description && (
          <Box className={styles.description}>
            <Typography variant="body1" className={styles.descriptionText}>
              {currentCategory.description}
            </Typography>
          </Box>
        )}

        {subcategories.length > 0 && (
          <Box className={styles.section}>
            <Typography
              variant="h5"
              component="h2"
              className={styles.sectionTitle}
            >
              Подкатегории
            </Typography>
            <Box className={styles.categoriesContainer}>
              <CategoryGrid categories={subcategories} />
            </Box>
          </Box>
        )}

        {categoryProducts.length > 0 && (
          <Box className={styles.section}>
            <Typography
              variant="h5"
              component="h2"
              className={styles.sectionTitle}
            >
              Товары в категории
            </Typography>
            <Box className={styles.searchBarContainer}>
              <SearchBar
                onSearch={handleSearch}
                placeholder="Поиск товаров в этой категории..."
              />
            </Box>
            <div className={styles.productGrid}>
              {filteredProducts.map((product: Product) => (
                <div key={product._id} className={styles.productGridItem}>
                  <ProductCard
                    product={product}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && searchQuery && (
              <Typography className={styles.noResults}>
                По вашему запросу ничего не найдено
              </Typography>
            )}
          </Box>
        )}

        {categoryProducts.length === 0 && (
          <Typography className={styles.emptyCategory}>
            В данной категории пока нет товаров
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default CategoryPage;

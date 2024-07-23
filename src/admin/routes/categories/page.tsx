import {
  useAdminProductCategories,
  adminProductCategoryKeys,
} from "medusa-react";

import { Button, Container, Text, useToggleState } from "@medusajs/ui";
import ProductCategoriesList from "../../components/categories/product-categories-list";
import { RouteConfig } from "@medusajs/admin";
import { Notify } from "../../types/notify";

import {
  BookOpen,
  Spinner,
  ExclamationCircle,
  PlusMini,
} from "@medusajs/icons";
import CategoryEditModal from "../../components/categories/category-edit-modal";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Product categories empty state placeholder.
 */
function ProductCategoriesEmptyState() {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <p className="text-grey-40">
        No product categories yet, use the above button to create your first
        category.
      </p>
    </div>
  );
}

function ProductCategoryErrorState() {
  return (
    <Container className="flex min-h-[320px] items-center justify-center mt-8">
      <div className="flex items-center gap-x-2">
        <ExclamationCircle className="text-ui-fg-base" />
        <Text className="text-ui-fg-subtle">
          An error occurred while loading profile details. Reload the page and
          try again. If the issue persists, try again later.
        </Text>
      </div>
    </Container>
  );
}

/**
 * Product category index page container.
 */
const CategoriesPage = ({ notify }: { notify: Notify }) => {
  const {
    state: isCreateModalVisible,
    open: showCreateModal,
    close: hideCreateModal,
  } = useToggleState();

  const queryClient = useQueryClient();

  const closeEditModal = async () => {
    hideCreateModal();
    await queryClient.invalidateQueries(adminProductCategoryKeys.lists());
  };

  const {
    product_categories: categories = [],
    isLoading,
    isError,
  } = useAdminProductCategories({
    parent_category_id: "null",
    include_descendants_tree: true,
  });

  const showPlaceholder = !isLoading && !categories.length;

  if (isError || !categories) {
    return <ProductCategoryErrorState />;
  }

  return (
    <>
      {isCreateModalVisible && (
        <CategoryEditModal
          isOpen={isCreateModalVisible}
          onClose={closeEditModal}
          category={null}
          categories={null}
          createNew={isCreateModalVisible}
          notify={notify}
        />
      )}
      <Container className="flex flex-col min-h-[640px] grow h-full w-full">
        <div className="flex justify-between align-top border-grey-20 border-b pb-4">
          <div>
            <h1 className="inter-xlarge-semibold text-grey-90">
              Product Categories management
            </h1>
            <h3 className="inter-small-regular text-grey-50 pt-1.5">
              Helps you to keep your products organized.
            </h3>
          </div>
          <Button
            variant="secondary"
            className="h-8 self-center"
            onClick={showCreateModal}
          >
            <PlusMini />
            New root category
          </Button>
        </div>
        <div className="flex flex-col justify-between mt-4 h-full w-full">
          {showPlaceholder ? (
            <ProductCategoriesEmptyState />
          ) : isLoading ? (
            <div className="flex h-max items-center justify-center">
              <Spinner className="text-ui-fg-subtle animate-spin" />
            </div>
          ) : (
            <ProductCategoriesList categories={categories!} notify={notify} />
          )}
        </div>
      </Container>
    </>
  );
};

export const config: RouteConfig = {
  link: {
    label: "Product categories",
    icon: BookOpen,
  },
};

export default CategoriesPage;

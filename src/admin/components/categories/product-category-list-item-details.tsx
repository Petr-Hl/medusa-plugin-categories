import { useState } from "react";
import { ProductCategory } from "@medusajs/medusa";
import { Tag, PlusMini } from "@medusajs/icons";
import {
  StatusBadge,
  IconButton,
  Tooltip,
  useToggleState,
  clx,
} from "@medusajs/ui";
import { CategoryActions } from "./action-menu";
import CategoryEditModal from "./category-edit-modal";
import { Notify } from "../../types/notify";

type ProductCategoryListItemDetailsProps = {
  depth: number;
  item: ProductCategory;
  categories: ProductCategory[];
  handler: React.ReactNode;
  collapseIcon: React.ReactNode;
  notify: Notify;
};

function ProductCategoryListItemDetails({
  depth,
  categories,
  item,
  handler,
  collapseIcon,
  notify,
}: ProductCategoryListItemDetailsProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(null);

  const hasChildren = !!item.category_children?.length;

  // const metadataContext = JSON.stringify(item.metadata).split(" ")[0];

  const {
    state: isCreateModalVisible,
    open: showCreateModal,
    close: hideCreateModal,
  } = useToggleState();

  const {
    state: isEditModalVisible,
    open: showEditModal,
    close: hideEditModal,
  } = useToggleState();

  const editCategory = (category: ProductCategory) => {
    setActiveCategory(category);
    showEditModal();
  };

  const closeEditModal = () => {
    setActiveCategory(null);
    hideEditModal();
    hideCreateModal();
  };

  const createSubCategory = (category: ProductCategory) => {
    setActiveCategory(category);
    showCreateModal();
  };

  return (
    <>
      <CategoryEditModal
        isOpen={
          !!activeCategory && (isEditModalVisible || isCreateModalVisible)
        }
        onClose={closeEditModal}
        category={activeCategory}
        categories={categories}
        createNew={isCreateModalVisible}
        notify={notify}
      />
      <div className="bg-ui-bg-component hover:bg-ui-bg-component-hover rounded-rounded">
        <div
          // style={{ marginLeft: depth * -8 }}
          className="flex w-full h-14 items-center"
        >
          <div className="flex w-8 items-center justify-center">{handler}</div>

          <div className="flex w-full items-center justify-between">
            <div className="flex w-full items-center">
              <div className="absolute flex w-5 items-center justify-center">
                {hasChildren ? collapseIcon : <Tag color="#a1a1aa" />}
              </div>
              <div
                className=" ml-8 flex items-center cursor-pointer w-full gap-x-2"
                onClick={() => editCategory(item)}
              >
                <div className="flex items-center gap-x-2">
                  {!item.metadata?.thumbnailImageUrl && (
                    <div className="flex w-14 h-10 items-center justify-center bg-ui-bg-component rounded-rounded border-[1px]"></div>
                  )}
                  {item.metadata?.thumbnailImageUrl && (
                    <div className="flex w-14 h-12 items-center justify-center">
                      <img
                        src={item.metadata.thumbnailImageUrl as string}
                        alt={`Thumbnail of ${item.name}`}
                        className="rounded-rounded max-w-14 max-h-12"
                      />
                    </div>
                  )}
                  <div
                    className={clx("select-none text-xs font-medium min-w-16", {
                      "font-normal text-ui-fg-muted": !hasChildren,
                    })}
                  >
                    {item.name}
                  </div>
                  <div className="select-none italic text-xs text-ui-fg-muted min-w-20">
                    {`(/${item.handle})`}
                  </div>
                  {item.description && (
                    <div className="select-none text-xs text-ui-fg-muted">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex w-[64px] items-center justify-center">
              <div className="flex flex-row min-w-16 justify-between items-left mr-4">
                <div className="flex flex-col gap-y-0 justify-center items-left">
                  <Tooltip
                    content={
                      item.is_internal
                        ? `Category visibility is private`
                        : "Category status is public"
                    }
                  >
                    <StatusBadge
                      color={!item.is_internal ? "green" : "blue"}
                      className="border-none"
                    >
                      {!item.is_internal ? "Public" : "Private"}
                    </StatusBadge>
                  </Tooltip>
                  <Tooltip
                    content={
                      item.is_active
                        ? "Category status is active"
                        : "Category status is inactive"
                    }
                  >
                    <StatusBadge
                      color={item.is_active ? "green" : "red"}
                      className="border-none"
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </StatusBadge>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip
                content={
                  <>
                    Add category item to
                    <span className="text-grey-80 font-semibold">
                      {` "${item.name}"`}
                    </span>
                  </>
                }
              >
                <IconButton
                  onClick={() => {
                    createSubCategory(item);
                  }}
                >
                  <PlusMini />
                </IconButton>
              </Tooltip>
              <CategoryActions
                category={item}
                notify={notify}
                onEdit={() => editCategory(item)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCategoryListItemDetails;

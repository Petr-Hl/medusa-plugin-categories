import {
  EllipsisHorizontal,
  Bolt,
  XCircle,
  PencilSquare,
  Trash,
} from "@medusajs/icons";
import {
  useAdminDeleteProductCategory,
  useAdminUpdateProductCategory,
  adminProductCategoryKeys,
} from "medusa-react";
import { ProductCategory } from "@medusajs/medusa";
import { DropdownMenu, IconButton, usePrompt } from "@medusajs/ui";
import { Notify } from "../../types/notify";
import PublishIcon from "../shared/icons/publish-icon";
import UnpublishIcon from "../shared/icons/unpublish-icon";
import { useQueryClient } from "@tanstack/react-query";

export function CategoryActions({
  category,
  onEdit,
  notify,
}: {
  category: ProductCategory;
  onEdit: () => void;
  notify: Notify;
}) {
  const prompt = usePrompt();
  const queryClient = useQueryClient();

  const { mutate } = useAdminDeleteProductCategory(category.id, {
    onSuccess: async () => {
      notify.success("Success", "Category deleted successfully");
      await queryClient.invalidateQueries(adminProductCategoryKeys.lists());
    },
    onError: (error) => {
      notify.error(
        "Error",
        `Error occurred while deleting category: "${error.message}"`
      );
    },
  });

  const updateCategory = useAdminUpdateProductCategory(category.id);

  const handleUpdateStatus = (changeTarget: "is_active" | "is_internal") => {
    updateCategory.mutate(
      {
        is_active:
          changeTarget === "is_active"
            ? !category.is_active
            : (category.is_active as boolean),
        is_internal:
          changeTarget === "is_internal"
            ? !category.is_internal
            : (category.is_internal as boolean),
      },
      {
        onSuccess: () => {
          notify.success("Success", "Category status changed successfully");
        },
        onError: (error) => {
          notify.error(
            "Error",
            `Error occurred while changing category status: "${error.message}"`
          );
        },
      }
    );
  };

  const onDelete = async () => {
    const confirmed = await prompt({
      title: `Deleting category ${category.name}`,
      description: "Are you sure you want to delete this category?",
      confirmText: "Delete",
    });

    if (confirmed) {
      mutate();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton variant="transparent">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item className="gap-x-2" onClick={onEdit}>
          <PencilSquare className="text-ui-fg-subtle" />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="gap-x-2"
          onClick={() => handleUpdateStatus("is_internal")}
        >
          {category.is_internal && (
            <>
              <PublishIcon className="text-ui-fg-subtle" />
              Publish
            </>
          )}
          {!category.is_internal && (
            <>
              <UnpublishIcon className="text-ui-fg-subtle" />
              Unpublish
            </>
          )}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="gap-x-2"
          onClick={() => handleUpdateStatus("is_active")}
        >
          {!category.is_active && (
            <>
              <Bolt className="text-ui-fg-subtle" />
              Activate
            </>
          )}
          {category.is_active && (
            <>
              <XCircle className="text-ui-fg-subtle" />
              Deactivate
            </>
          )}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item className="gap-x-2" onClick={onDelete}>
          <Trash className="text-ui-fg-subtle" />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

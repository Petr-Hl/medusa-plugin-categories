import { Drawer, Button, Text, Label, Input, Select } from "@medusajs/ui";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Notify } from "../../types/notify";
import { nestedForm } from "../../utils/nested-form";
import {
  useAdminUpdateProductCategory,
  useAdminCreateProductCategory,
  useAdminUploadFile,
  adminProductCategoryKeys,
} from "medusa-react";
import {
  AdminPostProductCategoriesCategoryReq,
  AdminPostProductCategoriesReq,
  ProductCategory,
} from "@medusajs/medusa";
import { Trash } from "@medusajs/icons";
import ImagesMediaForm, { MediaFormType } from "../shared/images-media-form";
import MetadataForm, {
  getMetadataFormValues,
  getSubmittableMetadata,
  MetadataFormType,
} from "../shared/meatadata-form";
import TreeCrumbs from "./utils/tree-crumbs";
import { useQueryClient } from "@tanstack/react-query";

export type CategoryDetailsFormValues = {
  parent_category_id?: string | null;
  name: string;
  handle: string;
  description: string;
  thumbnail: string;
  media?: MediaFormType;
  is_active: "active" | "inactive";
  is_internal: "public" | "private";
  type: "thumbnail" | "media";
  metadata: MetadataFormType;
};

const statuses = [
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
];

const published = [
  {
    label: "Public",
    value: "public",
  },
  {
    label: "Private",
    value: "private",
  },
];

// TODO - add prefix into the plugin configuration file
// const fileNamePrefix = "---"
const fileNamePrefix = "";

const getDefaultValues = (
  category: ProductCategory | null,
  createNew: boolean
): CategoryDetailsFormValues => {
  // Adding new child category
  if (createNew) {
    return {
      parent_category_id: category && category?.id ? category.id : null,
      name: "",
      handle: "",
      description: "",
      thumbnail: "",
      is_active: "active",
      is_internal: "public",
      media: {
        images: [],
      },
      type: "thumbnail",
      metadata: getMetadataFormValues({}),
    };
  }

  return {
    name: category?.name,
    handle: category?.handle,
    description: category?.description,
    thumbnail: (category?.metadata?.thumbnailImageUrl as string) || "",
    is_active: category?.is_active ? "active" : "inactive",
    is_internal: category?.is_internal ? "private" : "public",
    media: {
      images: [],
    },
    type: "thumbnail",
    metadata: getMetadataFormValues(category?.metadata, ["thumbnailImageUrl"]),
  };
};

const CategoryEditModal = ({
  category,
  categories,
  isOpen,
  onClose,
  createNew,
  notify,
}: {
  category: ProductCategory;
  categories: ProductCategory[];
  isOpen: boolean;
  onClose: () => void;
  createNew: boolean;
  notify: Notify;
}) => {
  const form = useForm<CategoryDetailsFormValues>({
    defaultValues: getDefaultValues(category, createNew),
  });

  // for update after change
  const queryClient = useQueryClient();
  // const { client } = useMedusa();
  const uploadFile = useAdminUploadFile();

  const { mutateAsync, isLoading } = useAdminUpdateProductCategory(
    category?.id
  );

  const { mutate } = useAdminCreateProductCategory();

  const [handlePreview, setHandlePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      form.reset(getDefaultValues(category, createNew));
      handlerSanitize(category.handle);
    }
  }, [category]);

  // useEffect(() => {
  //   if (form.watch("handle")) {
  //     setHandlePreview(
  //       encodeURI(form.watch("handle").replace(/ /g, "-").toLowerCase())
  //     );
  //   }
  // }, [form.watch("handle")]);

  const handlerSanitize = (value: string) => {
    setHandlePreview(
      value
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/ /g, "-")
        .toLowerCase()
    );
  };

  const onReset = () => {
    form.reset(getDefaultValues(category, createNew));
    onClose();
  };

  const handlerRemoveThumbnail = () => {
    form.setValue("thumbnail", "");
    // form.setValue("media", { images: [] });
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSaving(true);

    const nativeFiles = data.media.images.map(
      (i) =>
        new File([i.nativeFile], `${fileNamePrefix}${i.nativeFile.name}`, {
          type: i.nativeFile.type,
        })
    );
    const { uploads: uploadedImages } = await uploadFile.mutateAsync(
      nativeFiles
    );

    console.log("*** data.metadata before", data.metadata);
    // data.metadata.entries = data.metadata.entries.filter((entry) => {entry.value !== "thumbnail"});
    const metadataWithThumbnail = {
      ...getSubmittableMetadata(data.metadata),
      thumbnailImageUrl: uploadedImages[0]?.url || data.thumbnail || "",
    };
    console.log("*** metadataWithThumbnail: ", metadataWithThumbnail);

    const payload: AdminPostProductCategoriesCategoryReq & {
      thumbnail?: string;
    } = {
      name: data.name,
      description: data.description,
      thumbnail:
        uploadedImages[0]?.url ||
        data.media.images[0]?.url ||
        data.thumbnail ||
        "",
      handle: handlePreview,
      is_active: data.is_active === "active",
      is_internal: data.is_internal === "private",
      metadata: metadataWithThumbnail,
    };
    console.log("*** payload after: ", payload);
    // add new one category
    if (createNew) {
      const payloadNew: AdminPostProductCategoriesReq = {
        name: data.name,
        description: data.description,
        handle: handlePreview,
        is_active: data.is_active === "active",
        is_internal: data.is_internal === "private",
        metadata: metadataWithThumbnail,
        parent_category_id: data?.parent_category_id || null,
      };

      mutate(payloadNew, {
        onSuccess: async () => {
          notify.success("Success", `Category ${payloadNew.name} was added`);
          onReset();
          await queryClient.invalidateQueries(adminProductCategoryKeys.lists());
        },
        onError: () => {
          notify.error(
            "Error",
            `Error occurred while adding category ${payloadNew.name}`
          );
        },
      });
      setIsSaving(false);
      return;
    }

    // update existing category
    mutateAsync(payload, {
      onSuccess: async () => {
        notify.success("Success", `Category ${payload.name} was updated`);
        onReset();
        await queryClient.invalidateQueries(adminProductCategoryKeys.lists());
      },
      onError: () => {
        notify.error(
          "Error",
          `Error occurred while updating category ${payload.name}`
        );
      },
    });
    setIsSaving(false);
  });

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <Drawer.Content className="w-auto right-2 overflow-y-scroll">
        <form onSubmit={onSubmit}>
          <Drawer.Header>
            <Drawer.Title>
              {createNew ? (
                <>Add category{category ? ` to "${category.name}"` : ""}</>
              ) : (
                <>Update category</>
              )}
              <div className="my-6">
                <TreeCrumbs
                  nodes={categories}
                  currentNode={category}
                  showPlaceholder={true}
                  placeholderText={form.watch("name") || "New"}
                />
              </div>
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <div className="flex flex-col gap-y-4">
              {!createNew && (
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="thumbnail" className="text-ui-fg-subtle">
                    Thumbnail
                  </Label>
                  {!form.watch("thumbnail") && (
                    <ImagesMediaForm
                      form={nestedForm(form, "media")}
                      type="thumbnail"
                    />
                  )}
                  {form.watch("thumbnail") && (
                    <div className="max-w-[400px] h-auto">
                      <img
                        src={form.watch("thumbnail")}
                        alt={`Thumbnail of ${form.watch("name")}`}
                        className="rounded-rounded"
                      />
                    </div>
                  )}
                  {form.watch("thumbnail") && (
                    <Button
                      onClick={handlerRemoveThumbnail}
                      variant="secondary"
                      disabled={isLoading}
                      className="ml-auto"
                    >
                      <Trash /> Remove thumbnail
                    </Button>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name" className="text-ui-fg-subtle">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Womanswear underwear"
                  {...form.register("name")}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="handle" className="text-ui-fg-subtle">
                  Handle
                  <span className="italic">{` (.../category/${handlePreview})`}</span>
                </Label>
                <Input
                  id="handle"
                  onChangeCapture={(event) =>
                    handlerSanitize(event.currentTarget.value)
                  }
                  onFocus={(event) => {
                    if (event.currentTarget.value === "") {
                      event.currentTarget.value = form.getValues().name;
                      handlerSanitize(form.getValues().name);
                    }
                  }}
                  placeholder="womanswear-underwear"
                  {...form.register("handle")}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="description" className="text-ui-fg-subtle">
                  Description
                </Label>
                <Input
                  id="description"
                  type="textarea"
                  placeholder="A collection of womenswear underwear"
                  {...form.register("description")}
                />
              </div>
              <div className="flex flex-row flex-wrap gap-x-4">
                <div className="flex flex-col flex-1 gap-y-2">
                  <Label htmlFor="is_internal" className="text-ui-fg-subtle">
                    Published Status
                  </Label>
                  <Controller
                    name="is_internal"
                    control={form.control}
                    rules={{ required: true }}
                    render={({ field: { onChange, ...other } }) => (
                      <Select {...other} onValueChange={onChange}>
                        <Select.Trigger>
                          <Select.Value placeholder="Select public status" />
                        </Select.Trigger>
                        <Select.Content>
                          {published.map((item) => (
                            <Select.Item key={item.label} value={item.value}>
                              {item.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex flex-col flex-1 gap-y-2">
                  <Label htmlFor="is_active" className="text-ui-fg-subtle">
                    Active Status
                  </Label>
                  <Controller
                    name="is_active"
                    control={form.control}
                    rules={{ required: true }}
                    render={({ field: { onChange, ...other } }) => (
                      <Select {...other} onValueChange={onChange}>
                        <Select.Trigger>
                          <Select.Value placeholder="Select active status" />
                        </Select.Trigger>
                        <Select.Content>
                          {statuses.map((item) => (
                            <Select.Item key={item.value} value={item.value}>
                              {item.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="metadata" className="text-ui-fg-subtle">
                  Metadata
                </Label>
                <MetadataForm
                  form={nestedForm(form, "metadata")}
                  hiddenKeys={["thumbnailImageUrl"]}
                />
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary" disabled={isLoading}>
                Cancel
              </Button>
            </Drawer.Close>
            <Button isLoading={isLoading || isSaving}>Save</Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  );
};

export default CategoryEditModal;

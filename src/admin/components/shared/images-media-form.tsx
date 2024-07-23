import { clx } from "@medusajs/ui";
import { Controller, FieldArrayWithId, useFieldArray } from "react-hook-form";
import { type NestedForm } from "../../utils/nested-form";
import { FormImage } from "@medusajs/admin-ui/ui/src/types/shared";
import FileUploadField from "./file-upload-field";
import { CheckCircleSolid } from "@medusajs/icons";
import { useRef } from "react";

type ImageType = { selected: boolean } & FormImage;

export type MediaFormType = {
  images: ImageType[];
};

type Props = {
  form: NestedForm<MediaFormType>;
  type: "thumbnail" | "media";
};

const ImagesMediaForm = ({ form, type }: Props) => {
  const { control, path, setValue } = form;

  const singleSelection = type === "thumbnail";
  const { fields, append } = useFieldArray({
    control: control,
    name: path("images"),
  });

  const prevSelectedImage = useRef<number | undefined>(
    fields?.findIndex((field) => field.selected)
  );

  const handleFilesChosen = (files: File[]) => {
    if (files.length) {
      const toAppend = files.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        nativeFile: file,
        selected: type === "thumbnail",
      }));

      append(toAppend);
    }
  };

  const handleImageSelected = (index: number) => {
    if (singleSelection) {
      return;
    }
    if (prevSelectedImage.current !== undefined && singleSelection) {
      setValue(path(`images.${prevSelectedImage.current}.selected`), false);
    }
    prevSelectedImage.current = index;
  };

  return (
    <div>
      <div>
        <div>
          {!fields.length && singleSelection && (
            <FileUploadField
              onFileChosen={handleFilesChosen}
              placeholder="1200 x 1600 (3:4) recommended, up to 10MB each"
              multiple={!singleSelection}
              filetypes={["image/gif", "image/jpeg", "image/png", "image/webp"]}
              className="py-large"
            />
          )}
        </div>
      </div>
      {fields.length > 0 && (
        <div className="mt-large">
          {type === "media" ? (
            <div className="mb-small">
              <h2 className="inter-large-semibold mb-2xsmall">Uploads</h2>
              <p className="inter-base-regular text-grey-50 mb-large">
                <span>Select images to use in your market.</span>
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap space-x-4 max-w-[400px]">
            {fields.map((field, index) => {
              return (
                <Image
                  key={field.id}
                  image={field}
                  index={index}
                  form={form}
                  type={type}
                  onSelected={handleImageSelected}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

type ImageProps = {
  image: FieldArrayWithId<MediaFormType, "images", "id">;
  index: number;
  form: NestedForm<MediaFormType>;
  onSelected: (index: number) => void;
  type?: "thumbnail" | "media";
};

const Image = ({ image, index, form, type, onSelected }: ImageProps) => {
  const { control, path } = form;

  return (
    <Controller
      name={path(`images.${index}.selected`)}
      control={control}
      render={({ field: { value, onChange } }) => {
        return (
          <div className="relative">
            <button
              className={clx(
                "hover:bg-grey-5 rounded-rounded group flex items-center justify-between",
                {
                  "bg-grey-5": value,
                }
              )}
              type="button"
              onClick={() => {
                onChange(!value);
                if (!value) {
                  onSelected(index);
                }
              }}
            >
              <div className="gap-x-large flex items-center">
                <div
                  className={clx(
                    "flex items-center justify-center",
                    type === "thumbnail" ? "h-auto w-full" : "h-32 w-32"
                  )}
                >
                  <img
                    src={image.url}
                    alt={image.name || "Uploaded image"}
                    className={clx(
                      "rounded-rounded",
                      type === "thumbnail" ? null : "max-w-32 max-h-32"
                    )}
                  />
                </div>

                <span
                  className={clx("hidden", {
                    "!text-violet-60 bottom-xsmall right-xsmall absolute !block":
                      value,
                  })}
                >
                  <CheckCircleSolid />
                </span>
              </div>
            </button>
          </div>
        );
      }}
    />
  );
};

export default ImagesMediaForm;

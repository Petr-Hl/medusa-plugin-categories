import React, { useMemo } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { type NestedForm } from "../../utils/nested-form";
import { DropdownMenu, clx, IconButton } from "@medusajs/ui";
import {
  ArrowUpMini,
  ArrowDownMini,
  SquareTwoStackMini,
  XCircle,
  Trash,
  EllipsisVertical,
  ExclamationCircle,
} from "@medusajs/icons";

export type MetadataField = {
  key: string;
  value: string;
  state?: "existing" | "new";
};

export type MetadataFormType = {
  entries: MetadataField[];
  deleted?: string[];
  ignored?: Record<string, any>;
};

type MetadataProps = {
  form: NestedForm<MetadataFormType>;
  hiddenKeys: string[];
};

const MetadataForm = ({ form, hiddenKeys }: MetadataProps) => {
  const { control, path, register, setValue, getValues } = form;

  const { fields, remove, insert } = useFieldArray({
    control,
    name: path("entries"),
    keyName: "fieldKey",
  });

  const handleInsertAbove = (index: number) => {
    insert(index, { key: "", value: "" });
  };

  const handleInsertBelow = (index: number) => {
    insert(index + 1, { key: "", value: "" });
  };

  const handleDelete = (index: number) => {
    if (fields[index].state === "existing") {
      const deleted = getValues(path(`deleted`)) || [];

      setValue(path(`deleted`), [...deleted, fields[index].key], {
        shouldDirty: true,
      });
    }

    if (index === 0 && fields.length === 1) {
      setValue(path(`entries.${index}.value`), "", {
        shouldDirty: true,
      });
      setValue(path(`entries.${index}.key`), "", {
        shouldDirty: true,
      });
    } else {
      remove(index);
    }
  };

  const handleDuplicate = (index: number) => {
    insert(index + 1, { ...fields[index], state: undefined });
  };

  const handleClearContents = (index: number) => {
    setValue(path(`entries.${index}.value`), "", {
      shouldDirty: true,
    });
    setValue(path(`entries.${index}.key`), "", {
      shouldDirty: true,
    });
  };

  const subscriber = useWatch({
    control,
    name: path("entries"),
  });

  const ignoredSubscriber = useWatch({
    control,
    name: path("ignored"),
    defaultValue: {},
  });

  const ignoredLength = useMemo(() => {
    return Object.keys(ignoredSubscriber || {}).length;
  }, [ignoredSubscriber]);

  // If there is only one row and it is empty or there are no rows, disable the delete button
  const isDisabled = useMemo(() => {
    if (!subscriber?.length) {
      return true;
    }

    if (subscriber?.length === 1) {
      return (
        (subscriber[0].key === "" && subscriber[0].value === "") ||
        (subscriber[0].key === undefined && subscriber[0].value === undefined)
      );
    }

    return false;
  }, [subscriber]);

  const rowClasses =
    "divide-grey-20 grid grid-cols-[165px_1fr] divide-x divide-solid [&>div]:px-base [&>div]:py-xsmall";

  return (
    <>
      <div className="rounded-rounded border-grey-20 divide-grey-20 inter-base-regular divide-y border">
        <div
          className={clx(
            "inter-small-semibold bg-grey-5 rounded-t-rounded",
            rowClasses
          )}
        >
          <div>
            <p>Key</p>
          </div>
          <div className="">
            <p>Value</p>
          </div>
        </div>
        <div className="divide-grey-20 divide-y">
          {!fields.length ? (
            <MetadataRow
              onClearContents={() => handleClearContents(0)}
              onDelete={() => handleDelete(0)}
              onDuplicate={() => handleDuplicate(0)}
              onInsertAbove={() => handleInsertAbove(0)}
              onInsertBelow={() => handleInsertBelow(0)}
              isDisabled={isDisabled}
            >
              <div>
                <MetadataInput
                  {...register(path(`entries.${0}.key`))}
                  placeholder="Key"
                />
              </div>
              <div>
                <MetadataInput
                  {...register(path(`entries.${0}.value`))}
                  placeholder="Value"
                />
              </div>
            </MetadataRow>
          ) : (
            fields.map((field, index) => {
              return (
                <MetadataRow
                  key={field.fieldKey}
                  onClearContents={() => handleClearContents(index)}
                  onDelete={() => handleDelete(index)}
                  onDuplicate={() => handleDuplicate(index)}
                  onInsertAbove={() => handleInsertAbove(index)}
                  onInsertBelow={() => handleInsertBelow(index)}
                  isDisabled={isDisabled}
                >
                  <div>
                    <MetadataInput
                      {...register(path(`entries.${index}.key`))}
                      placeholder="Key"
                    />
                  </div>
                  <div>
                    <MetadataInput
                      {...register(path(`entries.${index}.value`))}
                      placeholder="Value"
                    />
                  </div>
                </MetadataRow>
              );
            })
          )}
        </div>
      </div>
      {ignoredLength > 0 && (
        <div className="rounded-rounded p-base gap-x-base mt-base flex items-start border border-[#FFD386] bg-[#FFECBC]">
          <div>
            <ExclamationCircle className="text-[#FFB224]" />
          </div>
          <div>
            <p className="inter-small-regular text-[#AD5700]">
              This entities metadata contains complex values that we currently
              don&apos;t support editing through the admin UI. Due to this{" "}
              {Object.keys(ignoredLength)} keys are currently not being
              displayed. You can still edit these values using the API.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default MetadataForm;

const MetadataInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={clx(
        "placeholder:text-grey-40 placeholder:inter-base-regular w-full appearance-none outline-none",
        className
      )}
      {...props}
    />
  );
});

MetadataInput.displayName = "MetadataInput";

type MetadataRowProps = React.PropsWithChildren<{
  onDuplicate: () => void;
  onInsertAbove: () => void;
  onInsertBelow: () => void;
  onDelete: () => void;
  onClearContents: () => void;
  isDisabled?: boolean;
}>;

const MetadataRow = ({
  onDuplicate,
  onInsertAbove,
  onInsertBelow,
  onDelete,
  onClearContents,
  isDisabled = false,
  children,
}: MetadataRowProps) => {
  const itemClasses =
    "px-base py-[6px] outline-none flex items-center gap-x-xsmall hover:bg-grey-5 focus:bg-grey-10 transition-colors cursor-pointer";

  return (
    <div className="last-of-type:rounded-b-rounded group/metadata relative">
      <div className="divide-grey-20 [&>div]:px-base [&>div]:py-xsmall grid grid-cols-[165px_1fr] divide-x divide-solid">
        {children}
      </div>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton
            size="small"
            className="h-xlarge w-large -right-small radix-state-open:opacity-100 absolute inset-y-1/2 -translate-y-1/2 transform opacity-0 transition-opacity group-hover/metadata:opacity-100"
          >
            <EllipsisVertical />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content asChild sideOffset={8}>
          <div className="bg-grey-0 shadow-dropdown border-grey-20 rounded-rounded z-50 overflow-hidden border">
            <DropdownMenu.Item onClick={onInsertAbove} className={itemClasses}>
              <ArrowUpMini />
              <span>Insert above</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={onInsertBelow} className={itemClasses}>
              <ArrowDownMini />
              <span>Insert below</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={onDuplicate} className={itemClasses}>
              <SquareTwoStackMini />
              <span>Duplicate</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={onClearContents}
              className={itemClasses}
            >
              <XCircle />
              <span>Clear contents</span>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="bg-grey-20 h-px w-full" />
            <DropdownMenu.Item
              onClick={onDelete}
              disabled={isDisabled}
              className={clx(
                {
                  "text-grey-40": isDisabled,
                  "text-rose-50": !isDisabled,
                },
                itemClasses,
                "hover:bg-grey-0"
              )}
            >
              <Trash />
              <span>Delete</span>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};

export const getSubmittableMetadata = (
  data: MetadataFormType
): Record<string, unknown> => {
  const metadata = data.entries.reduce((acc, { key, value }) => {
    if (key) {
      acc[key] = value;
    }

    return acc;
  }, {} as Record<string, unknown>);

  if (data.deleted?.length) {
    data.deleted.forEach((key) => {
      metadata[key] = "";
    });
  }

  // Preserve complex values that we don't support editing through the UI
  if (data.ignored) {
    Object.entries(data.ignored).forEach(([key, value]) => {
      metadata[key] = value;
    });
  }

  return metadata;
};

export const getMetadataFormValues = (
  metadata?: Record<string, any> | null,
  hiddenKeys: string[] = []
): MetadataFormType => {
  const data: MetadataFormType = {
    entries: [],
    deleted: [],
    ignored: {},
  };

  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      if (isPrimitive(value) && !hiddenKeys.includes(key)) {
        data.entries.push({
          key,
          value: value as string,
          state: "existing",
        });
      } else {
        data.ignored![key] = value;
      }
    });
  }

  return data;
};

const isPrimitive = (value: any): boolean => {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
};

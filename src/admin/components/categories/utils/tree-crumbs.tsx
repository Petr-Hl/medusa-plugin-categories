import React from "react";
import { ProductCategory } from "@medusajs/medusa";
import { getAncestors } from "./categories-utils";

type TreeCrumbsProps = React.HtmlHTMLAttributes<HTMLDivElement> & {
  nodes: ProductCategory[];
  currentNode: ProductCategory;
  showPlaceholder: boolean;
  placeholderText: string;
};

const TreeCrumbs: React.FC<TreeCrumbsProps> = ({
  nodes,
  currentNode,
  showPlaceholder = false,
  placeholderText = "",
  ...props
}) => {
  const ancestors = getAncestors(currentNode, nodes);

  return (
    <span {...props}>
      <span className="text-grey-40">
        {currentNode &&
          ancestors.map((ancestor, index) => {
            if (ancestor.id === currentNode.id && !showPlaceholder) {
              return null;
            }
            const categoryName = ancestor.name;

            return (
              <div key={ancestor.id} className="inline-block">
                <span>
                  {categoryName.length > 25
                    ? categoryName.substring(0, 25) + "..."
                    : categoryName}
                </span>
                <span className="mx-2">/</span>
              </div>
            );
          })}

        <span className="border-grey-40 rounded-[10px] border-[1px] border-dashed px-[8px] py-[4px]">
          {placeholderText}
        </span>
      </span>
    </span>
  );
};

export default TreeCrumbs;

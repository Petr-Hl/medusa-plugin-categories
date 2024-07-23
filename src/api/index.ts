import { registerOverriddenValidators } from "@medusajs/medusa"
import { IsString, IsOptional } from "class-validator";
import { AdminPostProductCategoriesCategoryReq as MedusaAdminPostProductCategoriesCategoryReq } from "@medusajs/medusa/dist/api/routes/admin/product-categories/update-product-category";

// Product category Images Validators
class AdminPostProductCategoriesCategoryReq extends MedusaAdminPostProductCategoriesCategoryReq {
  @IsString()
  @IsOptional()
  thumbnail: string;
}

registerOverriddenValidators(AdminPostProductCategoriesCategoryReq)

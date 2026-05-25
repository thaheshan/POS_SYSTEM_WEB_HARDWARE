/* Redirect `/products` to `/inventory` to match backend endpoints. */

import { redirect } from "next/navigation";

export default function ProductsPage() {
  redirect("/inventory");
}

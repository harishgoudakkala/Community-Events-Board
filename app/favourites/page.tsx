import { Suspense } from "react";
import { FavouritesPicker } from "@/components/FavouritesPicker";

export default function FavouritesPage() {
  return (
    <Suspense>
      <FavouritesPicker />
    </Suspense>
  );
}

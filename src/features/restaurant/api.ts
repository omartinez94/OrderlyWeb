import type {
  AdminRestaurantDetail,
  AdminRestaurantAddress,
  RestaurantStatus,
  OperatingHoursDay,
} from "../../types/catalog";
import {
  useGetRestaurantsQuery,
  useGetRestaurantQuery,
  useGetAdminRestaurantQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useArchiveRestaurantMutation,
  type CreateRestaurantRequest,
  type UpdateRestaurantRequest,
} from "../../app/api/catalog";

export {
  useGetRestaurantsQuery,
  useGetRestaurantQuery,
  useGetAdminRestaurantQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useArchiveRestaurantMutation,
};
export type {
  AdminRestaurantDetail,
  AdminRestaurantAddress,
  RestaurantStatus,
  OperatingHoursDay,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
};

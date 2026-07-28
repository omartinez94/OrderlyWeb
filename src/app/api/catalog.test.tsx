/**
 * Phase 2 proof — an RTK Query call goes through the full pipeline:
 *   - mount a `<Provider store={store}>` over a TestProvider
 *   - call `useGetRestaurantsQuery()` from the catalog slice
 *   - the request hits MSW at `http://localhost:6004/catalog-api/restaurants`
 *   - the response body matches the CatalogRestaurant shape
 *
 * This is the live `pnpm test:run` demonstration of the data layer.
 */

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "../store";
import { catalogApi, useGetRestaurantsQuery } from "./catalog";
import type { CatalogRestaurant } from "./catalog";

function Probe({ onResult }: { onResult: (data: CatalogRestaurant[] | undefined) => void }) {
  const { data, isSuccess, isError } = useGetRestaurantsQuery();
  useEffect(() => {
    if (isSuccess || isError) onResult(data);
  }, [data, isSuccess, isError, onResult]);
  return null;
}

function renderWithStore() {
  let captured: CatalogRestaurant[] | undefined;
  const utils = render(
    <Provider store={store}>
      <Probe
        onResult={(d) => {
          captured = d;
        }}
      />
    </Provider>,
  );
  return { ...utils, getResult: () => captured };
}

describe("RTK Query through MSW", () => {
  it("catalogApi.getRestaurants returns the mocked shape", async () => {
    const { getResult } = renderWithStore();

    await waitFor(() => {
      expect(getResult()).toBeDefined();
    });

    const result = getResult();
    expect(result).toHaveLength(2);
    expect(result?.[0]).toMatchObject({
      id: "r-001",
      name: "Acme Bistro — Downtown",
      cuisine: "Italian",
      active: true,
    });
  });

  it("catalogApi reducer is mounted under `catalogApi`", () => {
    const state = store.getState();
    expect(state[catalogApi.reducerPath]).toBeDefined();
    expect(state[catalogApi.reducerPath].queries).toBeDefined();
  });
});

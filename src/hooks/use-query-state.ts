import { useLocation, useNavigate } from "@tanstack/solid-router";

export function useQueryState(
  key: string,
  { defaultValue = "" }: { defaultValue: string },
) {
  const location = useLocation();
  const navigate = useNavigate();

  const value = () => {
    const current =
      location().search[key as keyof ReturnType<typeof location>["search"]];
    return typeof current === "string" ? current : defaultValue;
  };

  const setValue = (next: string) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        [key]: next === defaultValue ? undefined : next,
      }),
      replace: true,
    });
  };

  return [value, setValue] as const;
}

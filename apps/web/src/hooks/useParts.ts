import { useQuery } from "@tanstack/react-query";
import { api } from "../api.ts";

export function useParts() {
  return useQuery({ queryKey: ["parts"], queryFn: api.getParts });
}

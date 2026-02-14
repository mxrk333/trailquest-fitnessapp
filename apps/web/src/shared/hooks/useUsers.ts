import { trpc } from '@/lib/trpc'

export function useUsers() {
  return trpc.user.list.useQuery()
}

export function useUser(id: string) {
  return trpc.user.byId.useQuery(id)
}

export function useCreateUser() {
  return trpc.user.create.useMutation()
}

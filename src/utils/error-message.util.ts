export function DOESNT_EXISTS(field: string, id: any) {
  return { success: false, message: `${field} with id ${id} does not exists` };
}

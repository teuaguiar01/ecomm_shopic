"use server";

import { prisma } from "@/utils/prisma";


export async function getCategories(){
  return await prisma.productCategory.findMany({
    where: {
      name: {
        not: "Inativos"
      }
    }
  });
}



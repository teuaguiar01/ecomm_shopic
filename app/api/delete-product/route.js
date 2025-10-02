import { deleteProduct } from "@/app/admin/products/actions"

export async function POST(req) {
  const body = await req.json()
  const { productId } = body

  if (!productId) {
    return Response.json({ success: false, error: "ID do produto é obrigatório" })
  }

  try {
    const result = await deleteProduct(productId)
    
    if (result.success) {
      return Response.json({ success: true, message: result.message })
    } else {
      return Response.json({ success: false, error: result.message })
    }
  } catch (error) {
    console.error("Erro ao processar produto:", error)
    return Response.json({ success: false, error: "Erro ao processar produto" })
  }
}
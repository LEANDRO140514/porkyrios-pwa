import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import * as Sentry from '@sentry/nextjs';
import path from 'path';
import { unlink, access } from 'fs/promises';

async function deleteImageFile(publicId: string | null | undefined) {
  if (!publicId) return;
  const sanitized = path.basename(publicId);
  if (sanitized !== publicId) return;
  try {
    const filepath = path.join(process.cwd(), 'public', 'uploads', sanitized);
    await access(filepath);
    await unlink(filepath);
  } catch {
    // File doesn't exist or can't be deleted — ignore
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ error: 'Valid ID is required', code: 'INVALID_ID' }, { status: 400 });
      }
      const product = await db.select().from(products).where(eq(products.id, parseInt(id))).limit(1);
      if (product.length === 0) {
        return NextResponse.json({ error: 'Product not found', code: 'PRODUCT_NOT_FOUND' }, { status: 404 });
      }
      return NextResponse.json(product[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');

    let query = db.select().from(products);
    const conditions = [];

    if (search) {
      conditions.push(or(like(products.name, `%${search}%`), like(products.description, `%${search}%`)));
    }
    if (categoryId && !isNaN(parseInt(categoryId))) {
      conditions.push(eq(products.categoryId, parseInt(categoryId)));
    }
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query.orderBy(desc(products.createdAt)).limit(limit).offset(offset);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    Sentry.captureException(error, { tags: { api_route: '/api/products', method: 'GET' }, contexts: { request: { url: request.url } } });
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, categoryId, stock, image, imagePublicId, imageSize, active } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Product name is required', code: 'MISSING_NAME' }, { status: 400 });
    }
    if (price === undefined || price === null) {
      return NextResponse.json({ error: 'Product price is required', code: 'MISSING_PRICE' }, { status: 400 });
    }
    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'Price must be a positive number', code: 'INVALID_PRICE' }, { status: 400 });
    }
    if (categoryId !== undefined && categoryId !== null && isNaN(parseInt(categoryId))) {
      return NextResponse.json({ error: 'Invalid category ID', code: 'INVALID_CATEGORY_ID' }, { status: 400 });
    }

    const insertData: any = {
      name: name.trim(),
      price,
      stock: stock !== undefined ? stock : 0,
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (description !== undefined && description !== null) insertData.description = description.trim();
    if (categoryId !== undefined && categoryId !== null) insertData.categoryId = parseInt(categoryId);
    if (image !== undefined && image !== null) insertData.image = image.trim();
    if (imagePublicId !== undefined && imagePublicId !== null) insertData.imagePublicId = imagePublicId;
    if (imageSize !== undefined && imageSize !== null) insertData.imageSize = imageSize;

    const newProduct = await db.insert(products).values(insertData).returning();
    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    Sentry.captureException(error, { tags: { api_route: '/api/products', method: 'POST' }, contexts: { request: { url: request.url } } });
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Valid ID is required', code: 'INVALID_ID' }, { status: 400 });
    }

    const existingProduct = await db.select().from(products).where(eq(products.id, parseInt(id))).limit(1);
    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found', code: 'PRODUCT_NOT_FOUND' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, price, categoryId, stock, image, imagePublicId, imageSize, active } = body;

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json({ error: 'Price must be a positive number', code: 'INVALID_PRICE' }, { status: 400 });
    }
    if (categoryId !== undefined && categoryId !== null && isNaN(parseInt(categoryId))) {
      return NextResponse.json({ error: 'Invalid category ID', code: 'INVALID_CATEGORY_ID' }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date().toISOString() };

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ error: 'Product name cannot be empty', code: 'INVALID_NAME' }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) updateData.description = description !== null ? description.trim() : null;
    if (price !== undefined) updateData.price = price;
    if (categoryId !== undefined) updateData.categoryId = categoryId !== null ? parseInt(categoryId) : null;
    if (stock !== undefined) updateData.stock = stock;
    if (active !== undefined) updateData.active = active;

    // Garbage collection: delete old image file when replacing
    if (image !== undefined) {
      const oldPublicId = existingProduct[0].imagePublicId;
      if (oldPublicId && imagePublicId && oldPublicId !== imagePublicId) {
        await deleteImageFile(oldPublicId);
      }
      updateData.image = image !== null ? image.trim() : null;
    }
    if (imagePublicId !== undefined) updateData.imagePublicId = imagePublicId;
    if (imageSize !== undefined) updateData.imageSize = imageSize;

    const updatedProduct = await db.update(products).set(updateData).where(eq(products.id, parseInt(id))).returning();
    return NextResponse.json(updatedProduct[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    Sentry.captureException(error, { tags: { api_route: '/api/products', method: 'PUT' }, contexts: { request: { url: request.url } } });
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Valid ID is required', code: 'INVALID_ID' }, { status: 400 });
    }

    const existingProduct = await db.select().from(products).where(eq(products.id, parseInt(id))).limit(1);
    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found', code: 'PRODUCT_NOT_FOUND' }, { status: 404 });
    }

    // Garbage collect image on product deletion
    await deleteImageFile(existingProduct[0].imagePublicId);

    const deletedProduct = await db.delete(products).where(eq(products.id, parseInt(id))).returning();
    return NextResponse.json({ message: 'Product deleted successfully', product: deletedProduct[0] }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    Sentry.captureException(error, { tags: { api_route: '/api/products', method: 'DELETE' }, contexts: { request: { url: request.url } } });
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}

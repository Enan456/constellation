import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { infrastructureSchema } from '@/lib/validation';

const DATA_PATH = process.env.DATA_PATH || path.join(process.cwd(), 'data', 'infrastructure.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to read data:', error);
    return NextResponse.json(
      { error: 'Failed to read infrastructure data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the data
    const validationResult = infrastructureSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data format', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Write the data
    await fs.writeFile(DATA_PATH, JSON.stringify(validationResult.data, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save data:', error);
    return NextResponse.json(
      { error: 'Failed to save infrastructure data' },
      { status: 500 }
    );
  }
}

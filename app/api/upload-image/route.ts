import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2Client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, fileName } = body;

        if (!image || !fileName) {
            return NextResponse.json(
                { error: 'Image and fileName are required' },
                { status: 400 }
            );
        }

        // Base64データをBufferに変換
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // ファイル名にタイムスタンプを追加してユニークにする
        const timestamp = Date.now();
        const uniqueFileName = `drivers/${timestamp}-${fileName}`;

        // R2にアップロード
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: 'image/jpeg', // 必要に応じて動的に設定
        });

        await r2Client.send(command);

        // 公開URLを生成
        const publicUrl = `${R2_PUBLIC_URL}/${uniqueFileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload image', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

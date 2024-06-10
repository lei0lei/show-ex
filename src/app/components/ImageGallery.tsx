"use client";  // 这一行确保这个组件是客户端组件

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
const [images, setImages] = useState<string[]>([]);


export default function Home() {
    const [images, setImages] = useState<string[]>([]);
  
    useEffect(() => {
    async function fetchImages() {
        console.log("Fetching images..."); // 添加日志，确保 useEffect 执行
        try {
        const directory = "D:/data_ori_1/20.610"; // 替换为您的实际路径
        const result: string[] = await invoke("read_images_from_directory", { directory });
        console.log("Fetched images:", result); // 添加日志
        setImages(result);
        } catch (error) {
        console.error("Failed to load images:", error);
        }
    }

    fetchImages();
    }, []);

  return (
    <div>
      <h1>Image Gallery</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {images.map((image, index) => (
          <div key={index} style={{ margin: '10px' }}>
            <img src={`file://${image}`} alt={`Image ${index}`} style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

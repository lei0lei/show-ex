"use client";

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Grid, Typography, Paper, TextField, Button } from '@mui/material';
// import Image from 'next/image';
import { dialog } from '@tauri-apps/api';

// import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number,
) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),

];
const getRandomRows = (data: any[], count: number) => {
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const data = [
  { key: '产线', value: '1' },
  { key: '良率', value: 90 },
  { key: '产品', value: 'xxx' },
];

const colors = ['#FFC0CB', '#87CEEB', '#90EE90', '#FFD700', '#FFA07A', '#ADD8E6', ];


export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [directory, setDirectory] = useState<string>("");
  const [showImageGallery, setShowImageGallery] = useState<boolean>(false);
  const [fading, setFading] = useState<boolean[]>(Array(8).fill(false));
  const [currentRows, setCurrentRows] = useState(getRandomRows(rows, 3));
  const [fade, setFade] = useState(true);



  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentRows(getRandomRows(rows, 3));
        setFade(false);
      }, 500); // 配合CSS中的过渡时间
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenDirectoryPicker = async () => {
    try {
      const {dialog} = await import('@tauri-apps/api')
      const selectedDirectory = await dialog.open({
        directory: true,
        multiple: false,
        title: "Select a Directory",
      });
      
      if (typeof selectedDirectory === 'string') {
        setDirectory(selectedDirectory);
        console.log(directory)
      }
    } catch (error) {
      console.error("Failed to open directory picker:", error);
    }
  };

  const handleConfirmDirectory = () => {
    setShowImageGallery(true);
  };

  useEffect(() => {
    if (showImageGallery && directory) {
      fetchImages(directory); // 首次加载时立即获取图片

      const intervalId = setInterval(() => {
        updateImagesWithFade(directory);
      }, 4000);

      return () => clearInterval(intervalId); // 清除定时器
    }
  }, [directory, showImageGallery]);
  const updateImagesWithFade = (directory: string) => {
    setFading(Array(8).fill(true)); // 设置淡出效果
    setTimeout(async () => {
      await fetchImages(directory);
      setFading(Array(8).fill(false)); // 设置淡入效果
    }, 500); // 等待淡出效果完成
  };

  async function fetchImages(directory: string) {
    console.log("Fetching images...");
    try {
      // console.log(directory)

      // const directory = "C:/Users/admin/Desktop/齿轮件/齿轮数据集-20240429/004F"; // 替换为您的实际路径
      const result: string[] = await invoke("read_images_from_directory", { directory });
      // console.log("Fetched images:", result);

      // 从图片列表中随机选择8张图片，并且进行循环展示
      const randomImages = getRandomImages(result, 8);
      console.log("Random images:", randomImages);
      const formattedImages = result.map(imagePath => `https://asset.localhost/${imagePath}`);
      setImages(formattedImages);
      setCurrentIndex(0); // 重置当前图片索引为0
    } catch (error) {
      console.error("Failed to load images:", error);
    }
  }

  // 从图片列表中随机选择指定数量的图片
  function getRandomImages(images: string[], count: number): string[] {
    const shuffled = images.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  return (
    <div className="flex flex-col h-screen bg-blue-400">
  <h4 className="gallery-title text-2xl font-bold mb-4 flex-shrink-0 text-center mx-auto">XXXXXX系统</h4>
  {!showImageGallery && (
    <div className="grid grid-cols-12 gap-4 items-center flex-shrink-0">
      <div className="col-span-6">
        <input
          id="directory"
          className="w-full p-2 border rounded"
          placeholder="Directory"
          value={directory}
          disabled
        />
      </div>
      <div className="col-span-3">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
          onClick={handleOpenDirectoryPicker}
        >
          Choose Directory
        </button>
      </div>
      <div className="col-span-3">
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" 
          onClick={handleConfirmDirectory}
        >
          Confirm
        </button>
      </div>
    </div>
  )}
  {showImageGallery && (
    <div className="flex flex-1 overflow-hidden data-show">
      <div className="w-3/5 h-full p-4 overflow-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="gallery-paper p-4 bg-white rounded shadow">
              {images[index] ? (
                <img src={images[index]} alt={`Image ${index}`} className="gallery-image w-full h-full object-cover" />
              ) : (
                <div className="gallery-placeholder w-full h-48 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/5 h-full flex flex-col p-4 overflow-hidden data-show">
        <div className="flex-1 p-4 bg-white rounded shadow mb-4 overflow-auto data-show">
          <div className="grid grid-cols-2 gap-4">
            {data.map((item, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded">
                <h5 className="text-sm font-semibold">{item.key}</h5>
                <p className="text-xs">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Dessert (100g serving)</th>
                  <th className="py-2 px-4 border-b text-right">Calories</th>
                  <th className="py-2 px-4 border-b text-right">Fat (g)</th>
                  <th className="py-2 px-4 border-b text-right">Carbs (g)</th>
                  <th className="py-2 px-4 border-b text-right">Protein (g)</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row, index) => (
                  <tr key={index} className={`transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
                    <td className="py-2 px-4 border-b">{row.name}</td>
                    <td className="py-2 px-4 border-b text-right">{row.calories}</td>
                    <td className="py-2 px-4 border-b text-right">{row.fat}</td>
                    <td className="py-2 px-4 border-b text-right">{row.carbs}</td>
                    <td className="py-2 px-4 border-b text-right">{row.protein}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  )}
</div>

  );
}  
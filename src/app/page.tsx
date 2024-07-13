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

// 生成MES条码
function getRandomMESBarcode(): string {
  // 假设 MES 条码为 12 位数字
  // return Math.random().toString().slice(2, 14);
  return 'C016341360'+Math.random().toString().slice(2, 5);
}


function getRandomProductCode(): string {
  // 假设成品码为 8 位字母数字组合
  // return Math.random().toString(36).slice(2, 10).toUpperCase();
  return 'CA385W12800'
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() 返回 0-11，因此要加 1
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}


function getStatus(): string {
  // 90% 概率返回 'OK'，10% 概率返回 'NG'
  return Math.random() < 0.95 ? 'OK' : 'NG';
}

function createData() {
  const date = new Date();
  const formattedDate = formatDate(date); // 格式化日期
  const mesBarcode = getRandomMESBarcode();
  const productCode = getRandomProductCode();
  const status = getStatus();
  
  return { date: formattedDate, mesBarcode, productCode, status };
}

interface DataRow {
  date: string;
  mesBarcode: string;
  productCode: string;
  status: string;
}


const rows = Array.from({ length: 10 }, createData); // 生成 10 行数据


const getRandomRows = (count: number): DataRow[] => {
  return Array.from({ length: count }, createData);
};
function getRandomYield(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}
const initialData = [
  { key: '产线', value: '1' },
  { key: '良率', value: getRandomYield(98, 99) },
  { key: '产品', value: 'CA385W12800' },
];

const colors = ['#FFC0CB', '#87CEEB', '#90EE90', '#FFD700', '#FFA07A', '#ADD8E6', ];


export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [directory, setDirectory] = useState<string>("");
  const [showImageGallery, setShowImageGallery] = useState<boolean>(false);
  const [fading, setFading] = useState<boolean[]>(Array(8).fill(false));
  const [currentRows, setCurrentRows] = useState<DataRow[]>(getRandomRows(6));
  const [fade, setFade] = useState(true);
  const [data, setData] = useState(initialData);


  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentRows(getRandomRows(6));
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

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => prevData.map(item => 
        item.key === '良率' ? { ...item, value: getRandomYield(98, 99) } : item
      ));
    }, 3000); // 每3秒刷新一次良率

    return () => clearInterval(interval);
  }, []);


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
    <div className="flex flex-col h-screen background-image">
  <h1 className="gallery-title text-4xl font-bold mb-4 flex-shrink-0 text-center mx-auto mt-8">珠海格力工序AI检测系统</h1>
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
          选择图片目录
        </button>
      </div>
      <div className="col-span-3">
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" 
          onClick={handleConfirmDirectory}
        >
          确认
        </button>
      </div>
    </div>
  )}
  {showImageGallery && (
    
    <div className="flex flex-col flex-1 overflow-hidden">
          <div className="w-full flex justify-between items-center bg-blue-500 p-4 mb-12">
  <div className="flex-1 text-center text-white text-xl">
  <span>总工件</span><br />
  <span>999</span>
  </div>
  <div className="flex-1 text-center text-white text-xl">
  <span>OK</span><br />
  <span>999</span>
  </div>
  <div className="flex-1 text-center text-white text-xl">
  <span>NG</span><br />
  <span>1</span>
  </div>
</div>
    <div className="flex flex-1 overflow-hidden">
      <div className="w-3/5 h-full p-4 overflow-auto">
        <div className="fill-grid p-4 overflow-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="gallery-paper p-4 bg-white rounded shadow w-full h-full">
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
        <div className="p-4 overflow-auto flex-shrink-0">
          <div className="grid grid-cols-2 gap-4 items-center">
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
                  <th className="py-2 px-4 border-b">创建日期</th>
                  <th className="py-2 px-4 border-b text-right">MES 条码</th>
                  <th className="py-2 px-4 border-b text-right">成品码</th>
                  <th className="py-2 px-4 border-b text-right">状态</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row, index) => (
                  <tr key={index} className={`transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'} ${row.status === 'NG' ? 'bg-red-200' : 'bg-green-200'}`}>
                    <td className="py-2 px-4 border-b">{row.date}</td>
                    <td className="py-2 px-4 border-b text-right">{row.mesBarcode}</td>
                    <td className="py-2 px-4 border-b text-right">{row.productCode}</td>
                    <td className="py-2 px-4 border-b text-right">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
    </div>
  )}
</div>

  );
}  
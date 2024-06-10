// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;
use std::fs;

#[tauri::command]
fn read_images_from_directory(directory: String) -> Vec<String> {
    println!("read_images_from_directory called with directory: {}", directory);
    let mut image_paths = Vec::new();
    if let Ok(entries) = fs::read_dir(&directory) {
        for entry in entries {
            if let Ok(entry) = entry {
                if let Some(extension) = entry.path().extension() {
                    if extension == "png" || extension == "jpg" || extension == "jpeg" {
                        if let Some(path_str) = entry.path().to_str() {
                            let path_str = path_str.replace("\\", "/");
                            println!("Found image: {}", path_str);
                            image_paths.push(path_str);
                        }
                    }
                }
            }
        }
    } else {
        println!("Failed to read directory: {}", directory);
    }
    image_paths
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_images_from_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

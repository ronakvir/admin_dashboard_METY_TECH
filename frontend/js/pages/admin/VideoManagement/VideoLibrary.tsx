import React, { useState } from "react";
import ComponentVideoSearch from "./ComponentVideoSearch"
import ComponentWorkshop from "./ComponentWorkshop";

// Video table
export const videoDatabase: VideoData[] = [
  { id: 1, title: 'How to Improve Your Public Speaking Skills', duration: '45-60min', categories: ['Sports', 'Science'] },
  { id: 2, title: 'The History of the Internet', duration: '30-45min', categories: ['Entertainment', 'Education', 'Technology'] },
  { id: 3, title: 'How to Improve Your Public Speaking Skills', duration: '30-45min', categories: ['Entertainment', 'Business'] },
  { id: 4, title: 'Simple Home Repairs You Can Do Yourself', duration: '30-45min', categories: ['Science'] },
  { id: 5, title: 'The History of the Internet', duration: '45-60min', categories: ['Music'] },
  { id: 6, title: 'Understanding Cryptocurrency', duration: '30-45min', categories: ['Entertainment', 'Art'] },
  { id: 7, title: 'Yoga for Beginners', duration: '15-30min', categories: ['Art', 'Lifestyle', 'Business'] },
  { id: 8, title: 'How to Build a Website in 10 Minutes', duration: '45-60min', categories: ['Music'] },
  { id: 9, title: 'Top 10 Movies to Watch in 2025', duration: '<15min', categories: ['Lifestyle'] },
  { id: 10, title: 'Learn to Play Guitar in 30 Days', duration: '>60min', categories: ['Sports', 'Art', 'Business', 'Education'] },
  { id: 11, title: 'How to Travel on a Budget', duration: '>60min', categories: ['Education'] },
  { id: 12, title: 'The Importance of Mental Health', duration: '<15min', categories: ['Sports', 'Technology', 'Lifestyle', 'Entertainment'] },
  { id: 13, title: 'The Art of Photography', duration: '<15min', categories: ['Music', 'Art'] },
  { id: 14, title: 'Introduction to Machine Learning', duration: '<15min', categories: ['Business', 'Health', 'Entertainment', 'Music'] },
  { id: 15, title: 'Mastering the Art of Cooking', duration: '30-45min', categories: ['Music', 'Lifestyle'] },
  { id: 16, title: 'Fitness for Busy People', duration: '15-30min', categories: ['Lifestyle', 'Entertainment', 'Health', 'Technology'] },
  { id: 17, title: 'How to Build a Website in 10 Minutes', duration: '15-30min', categories: ['Entertainment', 'Art'] },
  { id: 18, title: 'Mastering the Art of Cooking', duration: '15-30min', categories: ['Entertainment'] },
  { id: 19, title: 'Learn to Play Guitar in 30 Days', duration: '>60min', categories: ['Health', 'Sports'] },
  { id: 20, title: 'The Art of Photography', duration: '>60min', categories: ['Business', 'Science', 'Technology'] },
  { id: 21, title: 'How to Start a Business from Scratch', duration: '>60min', categories: ['Lifestyle', 'Education', 'Technology'] },
  { id: 22, title: "Exploring the Universe: A Beginner's Guide", duration: '30-45min', categories: ['Education'] },
  { id: 23, title: 'Introduction to Machine Learning', duration: '15-30min', categories: ['Art', 'Lifestyle', 'Business'] },
  { id: 24, title: 'How to Build a Mobile App from Scratch', duration: '<15min', categories: ['Technology', 'Business', 'Entertainment', 'Education'] },
  { id: 25, title: "Exploring the Universe: A Beginner's Guide", duration: '30-45min', categories: ['Art', 'Music'] },
  { id: 26, title: 'Fitness for Busy People', duration: '45-60min', categories: ['Science', 'Entertainment', 'Lifestyle'] },
  { id: 27, title: 'Eco-Friendly Living Tips', duration: '>60min', categories: ['Science', 'Technology'] },
  { id: 28, title: 'The Best Workouts for Strength Training', duration: '15-30min', categories: ['Lifestyle', 'Music', 'Health', 'Entertainment'] },
  { id: 29, title: 'How to Stay Fit While Working from Home', duration: '<15min', categories: ['Science'] },
  { id: 30, title: 'Healthy Meal Prep Ideas', duration: '30-45min', categories: ['Entertainment', 'Art', 'Technology'] }
]

// unused Category table
export const videoCategories = [
  { id: 1, video_id: 0, category: "Sports" },
  { id: 2, video_id: 0, category: "Science" },
  { id: 3, video_id: 2, category: "Entertainment" },
  { id: 4, video_id: 2, category: "Education" },
  { id: 5, video_id: 2, category: "Technology" },
  { id: 6, video_id: 3, category: "Entertainment" },
  { id: 7, video_id: 3, category: "Business" },
  { id: 8, video_id: 4, category: "Science" },
  { id: 9, video_id: 5, category: "Music" },
  { id: 10, video_id: 6, category: "Entertainment" },
  { id: 11, video_id: 7, category: 'Art' },
  { id: 12, video_id: 7, category: 'Lifestyle' },
  { id: 13, video_id: 7, category: 'Business' },
  { id: 14, video_id: 8, category: 'Music' },
  { id: 15, video_id: 9, category: 'Lifestyle' },
  { id: 16, video_id: 10, category: 'Sports' },
  { id: 17, video_id: 10, category: 'Art' },
  { id: 18, video_id: 10, category: 'Business' },
  { id: 19, video_id: 10, category: 'Education' },
  { id: 20, video_id: 11, category: 'Education' },
  { id: 21, video_id: 12, category: 'Sports' },
  { id: 22, video_id: 12, category: 'Technology' },
  { id: 23, video_id: 12, category: 'Lifestyle' },
  { id: 24, video_id: 12, category: 'Entertainment' },
  { id: 25, video_id: 13, category: 'Music' },
  { id: 26, video_id: 13, category: 'Art' },
  { id: 27, video_id: 14, category: 'Business' },
  { id: 28, video_id: 14, category: 'Health' },
  { id: 29, video_id: 14, category: 'Entertainment' },
  { id: 30, video_id: 14, category: 'Music' },
  { id: 31, video_id: 15, category: 'Music' },
  { id: 32, video_id: 15, category: 'Lifestyle' },
  { id: 33, video_id: 16, category: 'Lifestyle' },
  { id: 34, video_id: 16, category: 'Entertainment' },
  { id: 35, video_id: 16, category: 'Health' },
  { id: 36, video_id: 16, category: 'Technology' },
  { id: 37, video_id: 17, category: 'Entertainment' },
  { id: 38, video_id: 17, category: 'Art' },
  { id: 39, video_id: 18, category: 'Entertainment' },
  { id: 40, video_id: 19, category: 'Health' },
  { id: 41, video_id: 19, category: 'Sports' },
  { id: 42, video_id: 20, category: 'Business' },
  { id: 43, video_id: 20, category: 'Science' },
  { id: 44, video_id: 20, category: 'Technology' },
  { id: 45, video_id: 21, category: 'Lifestyle' },
  { id: 46, video_id: 21, category: 'Education' },
  { id: 47, video_id: 21, category: 'Technology' },
  { id: 48, video_id: 22, category: 'Education' },
  { id: 49, video_id: 23, category: 'Art' },
  { id: 50, video_id: 23, category: 'Lifestyle' },
  { id: 51, video_id: 23, category: 'Business' },
  { id: 52, video_id: 24, category: 'Technology' },
  { id: 53, video_id: 24, category: 'Business' },
  { id: 54, video_id: 24, category: 'Entertainment' },
  { id: 55, video_id: 24, category: 'Education' },
  { id: 56, video_id: 25, category: 'Art' },
  { id: 57, video_id: 25, category: 'Music' },
  { id: 58, video_id: 26, category: 'Science' },
  { id: 59, video_id: 26, category: 'Entertainment' },
  { id: 60, video_id: 26, category: 'Lifestyle' },
  { id: 61, video_id: 27, category: 'Science' },
  { id: 62, video_id: 27, category: 'Technology' },
  { id: 63, video_id: 28, category: 'Lifestyle' },
  { id: 64, video_id: 28, category: 'Music' },
  { id: 65, video_id: 28, category: 'Health' },
  { id: 66, video_id: 28, category: 'Entertainment' },
  { id: 67, video_id: 29, category: 'Science' },
  { id: 68, video_id: 30, category: 'Entertainment' },
  { id: 69, video_id: 30, category: 'Art' },
  { id: 70, video_id: 30, category: 'Technology' }
]

export type SearchFields = {
  title: string;
  duration: string;
  category: string;
}
export type VideoData = {
  id: number;
  title: string;
  duration: string;
  categories: string[];
}

const VideoLibrary: React.FC = () => {

  const [searchFields, setSearchfields] = useState<SearchFields>({title: "", duration: "", category: ""});
  const [videoList, setVideoList] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData>({id: 0, title: "", duration: "", categories: [""]});
  const [videoWorkshop, setVideoWorkshop] = useState<string>("");

  return (
    <>
      <h3>Video Library Management</h3>
      <hr/>
      {videoWorkshop === "" ?
          <ComponentVideoSearch 
            searchFields={searchFields} setSearchFields={setSearchfields}
            videoList={videoList} setVideoList={setVideoList}
            selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}
            videoWorkshop={videoWorkshop} setVideoWorkshop={setVideoWorkshop}
          /> :
          <ComponentWorkshop 
            searchFields={searchFields} setSearchFields={setSearchfields}
            videoList={videoList} setVideoList={setVideoList}
            selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}
            videoWorkshop={videoWorkshop} setVideoWorkshop={setVideoWorkshop}
          />
      }

      <hr/>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
    </>
  );
};

export default VideoLibrary;

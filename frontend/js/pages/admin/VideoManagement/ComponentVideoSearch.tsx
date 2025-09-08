import { Dispatch, SetStateAction } from "react";
import { categoryTable, videoCategoriesMappingTable, videoTable } from "../../database";
import { GetVideoWithCategories, VideoSearch } from "../../../api/types.gen";
import { VideomanagementService } from "../../../api/services.gen";

// Define local types based on the API structure
type Category = {
    id: number;
    text: string;
};

type VideoData = {
    id: number;
    title: string;
    description: string;
    duration: string;
    url?: string | null;
    categories: Category[];
};

type VideoSearchFields = VideoSearch;

interface VideoManagementStates {
    searchFields:               VideoSearchFields;       setSearchFields:            Dispatch<SetStateAction<VideoSearchFields>>;
    videoList:                  VideoData[];        setVideoList:               Dispatch<SetStateAction<VideoData[]>>; 
    selectedVideo:              VideoData;          setSelectedVideo:           Dispatch<SetStateAction<VideoData>>; 
    videoWorkshop:              string;             setVideoWorkshop:           Dispatch<SetStateAction<string>>;
    categoryList:               Category[];         setCategoryList:            Dispatch<SetStateAction<Category[]>>;
}

const ComponentVideoSearch: React.FC<VideoManagementStates> = ({
    searchFields, setSearchFields,
    videoList, setVideoList,
    selectedVideo, setSelectedVideo,
    videoWorkshop, setVideoWorkshop,
    categoryList, setCategoryList,}) => {
    

    const updateTitleState = (newText: React.ChangeEvent<HTMLInputElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.title = newText.target.value;
        setSearchFields(tempSearchFields);
    }

    const updateDurationState = (selectedOption: React.ChangeEvent<HTMLInputElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.duration = selectedOption.target.value;
        setSearchFields(tempSearchFields);
    }

    const updateCategoryState = (selectedOption: React.ChangeEvent<HTMLInputElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.category = selectedOption.target.value;
        setSearchFields(tempSearchFields);
    }

    const modifyVideoButton = (video: VideoData) => {
        setVideoList([]);
        setSelectedVideo(video);
        setVideoWorkshop("modify");
        setSearchFields({title: "", duration: "", category: ""});
        return;
    }

    const addVideoButton = () => {
        setVideoList([]);
        setSelectedVideo({id: 0, title: "", description: "", duration: "", url: "", categories: [{id: 0, text: ""}]});
        setVideoWorkshop("new");
        setSearchFields({title: "", duration: "", category: ""});
    }

    // GET VIDEOS API
    const searchButton = () => {
        setVideoList([]);
        const requestData = {
            title: searchFields.title,
            duration: searchFields.duration,
            category: searchFields.category
        }

        VideomanagementService.videomanagementGetvideosCreate({ requestBody: requestData })
            .then( response => {
                // Convert GetVideoWithCategories[] to VideoData[]
                const videoDataList: VideoData[] = response.map(video => ({
                    id: video.id,
                    title: video.title,
                    duration: video.duration,
                    description: video.description,
                    url: video.url || "",
                    categories: Array.isArray(video.categories) ? video.categories : []
                }));
                setVideoList(videoDataList);
            })
            .catch( error => console.log(error) )
    }

    // DELETE VIDEO API
    const deleteVideoButton = (videoID: number) => {
        if (confirm("This will permanently delete this video. Are you sure?")) {
            VideomanagementService.videomanagementDeletevideoDestroy({ id: videoID })
                .then( response => {
                    const tempVideoList = [ ...videoList ];
                    const index = videoList.findIndex( video => video.id === videoID);
                    tempVideoList.splice(index, 1);
                    setVideoList(tempVideoList);
                    setSearchFields({title: "", duration: "", category: ""});
                })
                .catch( error => console.log(error) )
        }
    }

    return (
        <>
            <div style={{display: "flex", flexDirection: "row"}}>
                <h4>Search Videos</h4>
                <button onClick={() => addVideoButton()}>Add New Video</button>
            </div>
            <hr/>
            <div style={{display: "flex", flexDirection: "column", width: "250px"}}>
                
                <input  type="text" placeholder="Title" onChange={updateTitleState} style={{flex: "1"}}></input>
                <input type="text" placeholder="Duration (e.g., 3:20, 45:30)" onChange={updateDurationState} style={{flex: "1"}}></input>
                {/* I want to implement this category text field so that it shows a preview of the available options as you start typeing */}
                <input list="categoryList" style={{flex: "1"}} type="text" placeholder="Category" onChange={updateCategoryState}></input>
                <datalist id="categoryList">
                    {categoryList.map((category: Category) => {
                        return (
                            <option value={category.text} />
                        )
                    })}
                </datalist>
                <br/>
                <button style={{flex: "1"}} onClick={() => searchButton()}>Search</button>
            </div>

            <hr/>

            {videoList.length > 0 ?
            <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", border: "1px solid black", backgroundColor: "lightgrey"}}>
                <label style={{width: "300px"}}>Title</label>
                <label style={{width: "100px"}}>Duration</label>
                <label style={{width: "300px"}}>URL</label>
                <label style={{width: "200px"}}>Categories</label>
            </div> :
            <></>
            }
            {videoList.map ((video: VideoData, index: number) => {
                return(
                    <div key={video.id} style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", border: "1px solid black"}}>
                            <label style={{width: "300px"}}>{video.title}</label>
                            <label style={{width: "100px"}}>{video.duration}</label>
                            <label style={{width: "300px", wordBreak: "break-all"}}>{video.url || "No URL"}</label>
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start"}}>
                                {video.categories.map((category: Category, index: number) => {
                                    return (
                                        <label key={index} style={{width: "200px"}}>{category.text}</label>
                                    )
                                })}
                            </div>
                            <button style={{height: "auto"}} onClick={() => modifyVideoButton(video)}>Modify</button>
                            <button style={{height: "auto"}} onClick={() => deleteVideoButton(video.id)}>Delete</button>
                        </div>
                )
            })}
        </>
    );
};

export default ComponentVideoSearch
import { Dispatch, SetStateAction } from "react";
import { SearchFields, VideoData } from "./VideoLibrary";
import { categoryTable, videoCategoriesMappingTable, videoTable } from "../../database";

interface VideoManagementStates {
    searchFields:               SearchFields;       setSearchFields:            Dispatch<SetStateAction<SearchFields>>;
    videoList:                  VideoData[];        setVideoList:               Dispatch<SetStateAction<VideoData[]>>; 
    selectedVideo:              VideoData;          setSelectedVideo:           Dispatch<SetStateAction<VideoData>>; 
    videoWorkshop:              string;             setVideoWorkshop:           Dispatch<SetStateAction<string>>;
}

const ComponentVideoSearch: React.FC<VideoManagementStates> = ({
    searchFields, setSearchFields,
    videoList, setVideoList,
    selectedVideo, setSelectedVideo,
    videoWorkshop, setVideoWorkshop}) => {
    
    const cycleDurationField = (direction: number) => {
        const dropdownBox = document.getElementById("durations") as HTMLSelectElement;
        let index = (dropdownBox.selectedIndex + direction + dropdownBox.options.length) % dropdownBox.options.length;
        dropdownBox.selectedIndex = index;
        
        const tempSearchFields = {...searchFields};
        tempSearchFields.duration = dropdownBox.value;
        setSearchFields(tempSearchFields);
    }

    const updateTitleState = (newText: React.ChangeEvent<HTMLInputElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.title = newText.target.value;
        setSearchFields(tempSearchFields);
    }

    const updateDurationState = (selectedOption: React.ChangeEvent<HTMLSelectElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.duration = selectedOption.target.value;
        setSearchFields(tempSearchFields);
    }

    const updateCategoryState = (selectedOption: React.ChangeEvent<HTMLInputElement>) => {
        const tempSearchFields = {...searchFields};
        tempSearchFields.category = selectedOption.target.value;
        setSearchFields(tempSearchFields);
    }

    const searchButton = () => {
        setVideoList([]);
        
        // Call API Here

        // Start testing code:
        const titleRegex = new RegExp(`.*` + searchFields.title.toLowerCase() + `.*`);
        const durationRegex = new RegExp(`.*` + searchFields.duration.toLowerCase() + `.*`);
        const categoryRegex = new RegExp(`.*` + searchFields.category.toLowerCase() + `.*`);

        const tempVideoList: VideoData[] = Array.from(videoTable).filter(([key1, video]) => {
            const titleCheck = titleRegex.test(video.title.toLowerCase());
            const durationCheck = durationRegex.test(video.duration.toLowerCase());
            const categoryCheck = Array.from(videoCategoriesMappingTable).some(([, videoCategory]) => {
                if (videoCategory.videoID === key1) {
                    return categoryRegex.test(categoryTable.get(videoCategory.categoryID)?.category.toLowerCase() as string);
                }
            })

            return (titleCheck && durationCheck && categoryCheck);
        })
        .map(([key, video]) => {
            const categories = Array.from(videoCategoriesMappingTable)
            .filter(([, videoCategory]) => key === videoCategory.videoID)
            .map(([catID, category]) => {return {id: category.categoryID, category: categoryTable.get(category.categoryID)?.category}})
            .filter((cat): cat is {id: number, category: string} => cat.category !== undefined);
            return {
                id: key,
                title: video.title,
                description: video.description,
                duration: video.duration,
                categories
            }
        })
        console.log(tempVideoList);
        // End Testing Code

        setVideoList(tempVideoList);
    }


    const modifyVideoButton = (video: VideoData) => {
        setVideoList([]);
        setSelectedVideo(video);
        setVideoWorkshop("modify");
        setSearchFields({title: "", duration: "", category: ""});
        return;
    }

    const deleteVideoButton = (videoTobeDeleted: VideoData) => {
        if (confirm("This will permanently delete this video. Are you sure?")) {
            // CALL DELETE API HERE

            // START TESTING CODE - Simulated deleting from database
            videoTable.delete(videoTobeDeleted.id);
            // END TESTING CODE

            const tempVideoList = [ ...videoList ];
            for(let i = 0; i < videoList.length; i++) {
                if (videoList[i].id === videoTobeDeleted.id) {
                    tempVideoList.splice(i, 1);
                    setVideoList(tempVideoList);
                    break;
                }
            }
            setSearchFields({title: "", duration: "", category: ""});
        }
    }

    const addVideoButton = () => {
        setVideoList([]);
        setSelectedVideo({id: 0, title: "", description: "", duration: "", categories: [{id: 0, category: ""}]});
        setVideoWorkshop("new");
        setSearchFields({title: "", duration: "", category: ""});
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
                <div style={{flex: "1"}}>
                    <label>Duration:</label>
                    <button onClick={() => {cycleDurationField(-1)}}>&lt;</button>
                    <select id="durations" onChange={updateDurationState}>
                        <option value=""></option>
                        <option value="<15min">&lt; 15 minutes</option>
                        <option value="15-30min">15-30 minutes</option>
                        <option value="30-45min">30-45 minutes</option>
                        <option value="45-60min">45-60 minutes</option>
                        <option value=">60min">60+ minutes</option>
                    </select>
                    <button onClick={() => {cycleDurationField(1)}}>&gt;</button>
                </div>
                {/* I want to implement this category text field so that it shows a preview of the available options as you start typeing */}
                <input style={{flex: "1"}} type="text" placeholder="Category" onChange={updateCategoryState}></input>
                <br/>
                <button style={{flex: "1"}} onClick={() => searchButton()}>Search</button>
            </div>

            <hr/>

            {videoList.length > 0 ?
            <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", border: "1px solid black", backgroundColor: "lightgrey"}}>
                <label style={{width: "500px"}}>Title</label>
                <label style={{width: "100px"}}>Duration</label>
                <label style={{width: "100px"}}>Categories</label>
            </div> :
            <></>
            }
            {videoList.map ((video, index) => {
                return(
                    <>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", border: "1px solid black"}}>
                            <label style={{width: "500px"}}>{video.title}</label>
                            <label style={{width: "100px"}}>{video.duration}</label>
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start"}}>
                                {video.categories.map((category, index) => {
                                    return (
                                        <label style={{width: "100px"}}>{category.category}</label>
                                    )
                                })}
                            </div>
                            <button onClick={() => modifyVideoButton(video)}>Modify</button>
                            <button onClick={() => deleteVideoButton(video)}>Delete</button>
                        </div>
                    </>
                )
            })}
        </>
    );
};

export default ComponentVideoSearch
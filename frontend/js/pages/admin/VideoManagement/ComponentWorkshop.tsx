import { Dispatch, SetStateAction } from "react";
import { SearchFields, VideoData } from "./VideoLibrary";
import { categoryTable, videoCategoriesMappingTable, videoTable } from "../../database";

interface VideoManagementStates {
    searchFields:               SearchFields;       setSearchFields:            Dispatch<SetStateAction<SearchFields>>;
    videoList:                  VideoData[];        setVideoList:               Dispatch<SetStateAction<VideoData[]>>; 
    selectedVideo:              VideoData;          setSelectedVideo:           Dispatch<SetStateAction<VideoData>>; 
    videoWorkshop:              string;             setVideoWorkshop:           Dispatch<SetStateAction<string>>;
}
export let indexCounter = 100;
const ComponentWorkshop: React.FC<VideoManagementStates> = ({
    searchFields, setSearchFields,
    videoList, setVideoList,
    selectedVideo, setSelectedVideo,
    videoWorkshop, setVideoWorkshop}) => {


        const cycleDurationField = (direction: number) => {
            const dropdownBox = document.getElementById("durations") as HTMLSelectElement;
            let index = (dropdownBox.selectedIndex + direction + dropdownBox.options.length) % dropdownBox.options.length;
            dropdownBox.selectedIndex = index;
            
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.duration = dropdownBox.value;
            setSelectedVideo(tempSearchFields);
        }

        const updateTitleState = (newText: React.ChangeEvent<HTMLInputElement>) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.title = newText.target.value;
            setSelectedVideo(tempSearchFields);
        }
    
        const updateDurationState = (selectedOption: React.ChangeEvent<HTMLSelectElement>) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.duration = selectedOption.target.value;
            setSelectedVideo(tempSearchFields);
        }
    
        const updateCategoryState = (selectedOption: React.ChangeEvent<HTMLInputElement>, index: number) => {
            const tempSearchFields = {...selectedVideo};

            tempSearchFields.categories[index].id = 0
            tempSearchFields.categories[index].category = selectedOption.target.value;
            setSelectedVideo(tempSearchFields);
        }

        const addCategoryField = () => {
            setSelectedVideo({ ...selectedVideo, categories: [ ...selectedVideo.categories, {id: 0, category: ""} ]});
        }

        const deleteCategoryField = (index: number) => {
            if (selectedVideo.categories.length < 2) return;

            const tempSearchFields = [ ...selectedVideo.categories ];
            tempSearchFields.splice(index, 1);
            setSelectedVideo({ ...selectedVideo, categories: tempSearchFields });
        }

        const cancelButton = () => {
            
            setVideoWorkshop("");
            setSelectedVideo({id: 0, title: "", description: "", duration: "", categories: [{id: 0, category: ""}]});
        }

        const addVideoButton = () => {
            const file = document.getElementById("fileInput");

            // do input validation
            if (file?.isDefaultNamespace.length === 0) {alert("You must choose a file to upload!"); return;}
            if (selectedVideo.duration === "") {alert("You must enter a duration!"); return; }
            if (selectedVideo.title === "") {alert("You must enter a title!");return;}
            for (let i = 0; i < selectedVideo.categories.length; i++) {if (selectedVideo.categories[i].category === "") {alert("You must remove empty category fields!"); return;}}

            // ADD API STUFF HERE. 
            // WE NEED TO FIGURE OUT HOW TO XFER THE FILE OVER THE API CALL 
            // THEN ADD THE FILE PATH TO THE DATABASE RECORD.
            
            // START TEST CODE
            // This calculates the new index
            let videoIndex = indexCounter;
            indexCounter++;

            // Create new video record
            videoTable.set(videoIndex, {title: selectedVideo.title, description: selectedVideo.description, duration: selectedVideo.duration});
            
            // Create category records tied to this video
            selectedVideo.categories.forEach((svCat) => {
                let catIndex = svCat.id;
                if (svCat.id !== 0) return;

                // Check if the category exists in the DB. if it does, set it to the working catIndex variable
                const test = Array.from(categoryTable).some(([tableKey, tableCategory]) => {
                    if (tableCategory.category === svCat.category) {
                        catIndex = tableKey;
                        return true;
                    }
                });

                // This creates a new category record if none existed yet
                if (!test) {
                    catIndex = indexCounter;
                    indexCounter++;
                    categoryTable.set(catIndex, {category: svCat.category});
                } 

                // Creates a new vid cat mapping record
                let mapIndex = indexCounter;
                videoCategoriesMappingTable.set(mapIndex, { videoID: videoIndex, categoryID: catIndex });
                indexCounter++;
            })

            // END TEST CODE

            setVideoWorkshop("");
            setSelectedVideo({id: 0, title: "", description: "", duration: "", categories: [{id: 0, category: ""}]});
        }

        const modifyVideoButton = () => {
            // do input validation
            if (selectedVideo.duration === "") {alert("You must enter a duration!"); return;}
            if (selectedVideo.title === "") {alert("You must enter a title!"); return;}
            for (let i = 0; i < selectedVideo.categories.length; i++) {if (selectedVideo.categories[i].category === "") {alert("You must remove empty category fields!");return;}}
            
            // ADD API STUFF HERE.

            // START TEST CODE
            // This calculates the new index


            // Create new video record
            videoTable.set(selectedVideo.id, {title: selectedVideo.title, description: selectedVideo.description, duration: selectedVideo.duration});
            
            // Deletes all mapped categories
            for (let i = 0; i < indexCounter; i++) {
                if (videoCategoriesMappingTable.get(i+1)?.videoID === selectedVideo.id) {
                    videoCategoriesMappingTable.delete(i+1);
                    i--;
                }
                
            }

            // Create new category records tied to this video
            selectedVideo.categories.forEach((svCat) => {
                let catIndex = svCat.id;

                // Check if the category exists in the DB. if it does, set it to the working catIndex variable
                const test = Array.from(categoryTable).some(([tableKey, tableCategory]) => {
                    if (tableCategory.category === svCat.category) {
                        catIndex = tableKey;
                        return true;
                    }
                });

                // This creates a new category record if none existed yet
                if (!test) {
                    catIndex = indexCounter;
                    indexCounter++;
                    categoryTable.set(catIndex, {category: svCat.category});
                } 

                // Creates a new vid cat mapping record
                let mapIndex = indexCounter;
                videoCategoriesMappingTable.set(mapIndex, { videoID: selectedVideo.id, categoryID: catIndex });
                indexCounter++;
            })

            // END TEST CODE

            setVideoWorkshop("");
            setSelectedVideo({id: 0, title: "", description: "", duration: "", categories: [{id: 0, category: ""}]});
        }

        return(
            <>            
                <div style={{display: "flex", flexDirection: "row"}}>
                    {videoWorkshop === "new" ?
                        <h4>Add New Video</h4> :
                        <h4>Modify Video</h4>
                    }
                    <button onClick={() => cancelButton()}>Cancel</button>
                </div>
                <hr/>
                <div style={{display: "flex", flexDirection: "column", width: "250px"}}>
                    
                    <input type="text" value={selectedVideo.title} placeholder="Title" onChange={updateTitleState} style={{flex: "1"}}></input>
                    <div style={{flex: "1"}}>
                        <label>Duration:</label>
                        <button onClick={() => {cycleDurationField(-1)}}>&lt;</button>
                        <select value={selectedVideo.duration} id="durations" onChange={updateDurationState}>
                            <option value=""></option>
                            <option value="<15min">&lt; 15 minutes</option>
                            <option value="15-30min">15-30 minutes</option>
                            <option value="30-45min">30-45 minutes</option>
                            <option value="45-60min">45-60 minutes</option>
                            <option value=">60min">60+ minutes</option>
                        </select>
                        <button onClick={() => {cycleDurationField(1)}}>&gt;</button>
                    </div>

                    
                    { /* I want to implement this category text field so that it shows a preview of the available options as you start typeing */
                    selectedVideo.categories.map((category, index) => (
                        <div key={index} style={{flex: "1"}}>
                            <input onChange={(value) => updateCategoryState(value, index)} value={selectedVideo.categories[index].category} name="category" type="text" placeholder="Category"/>
                            <button onClick={ async () => deleteCategoryField(index) }>X</button>
                        </div>
                    ))
                    }
                    <button onClick={() => setSelectedVideo({ ...selectedVideo, categories: [ ...selectedVideo.categories, {id: 0, category: "" }]})} style={{flex: "1"}}>Add Category</button>

                    
                    {videoWorkshop === "new" ?
                        <>
                            <input name="fileInput" id="fileInput" type="file"></input>
                            <br/>
                            <button onClick={ () => addVideoButton() } style={{flex: "1"}} >Add Video</button>
                        </> :
                        <>
                            <br/>
                            <button onClick={ () => modifyVideoButton() } style={{flex: "1"}} >Confirm Changes</button>
                        </>
                        
                    }
                </div>


            </>
        )
}

export default ComponentWorkshop;



export let videoTableIndex = 30;
// videoTable(id: number, title: string, duration: string, description: string);
export const videoTable = new Map([
    [1, { title: 'How to Improve Your Public Speaking Skills', duration: '45-60min', description: '...' }],
    [2, { title: 'The History of the Internet', duration: '30-45min', description: '...' }],
    [3, { title: 'How to Improve Your Public Speaking Skills', duration: '30-45min', description: '...' }],
    [4, { title: 'Simple Home Repairs You Can Do Yourself', duration: '30-45min', description: '...' }],
    [5, { title: 'The History of the Internet', duration: '45-60min', description: '...' }],
    [6, { title: 'Understanding Cryptocurrency', duration: '30-45min', description: '...' }],
    [7, { title: 'Yoga for Beginners', duration: '15-30min', description: '...' }],
    [8, { title: 'How to Build a Website in 10 Minutes', duration: '45-60min', description: '...' }],
    [9, { title: 'Top 10 Movies to Watch in 2025', duration: '<15min', description: '...' }],
    [10, { title: 'Learn to Play Guitar in 30 Days', duration: '>60min', description: '...' }],
    [11, { title: 'How to Travel on a Budget', duration: '>60min', description: '...' }],
    [12, { title: 'The Importance of Mental Health', duration: '<15min', description: '...' }],
    [13, { title: 'The Art of Photography', duration: '<15min', description: '...' }],
    [14, { title: 'Introduction to Machine Learning', duration: '<15min', description: '...' }],
    [15, { title: 'Mastering the Art of Cooking', duration: '30-45min', description: '...' }],
    [16, { title: 'Fitness for Busy People', duration: '15-30min', description: '...' }],
    [17, { title: 'How to Build a Website in 10 Minutes', duration: '15-30min', description: '...' }],
    [18, { title: 'Mastering the Art of Cooking', duration: '15-30min', description: '...' }],
    [19, { title: 'Learn to Play Violin in 30 Days', duration: '>60min', description: '...' }],
    [20, { title: 'The Art of Photography', duration: '>60min', description: '...' }],
    [21, { title: 'How to Start a Business from Scratch', duration: '>60min', description: '...' }],
    [22, { title: "Exploring the Universe: A Beginner's Guide", duration: '30-45min', description: '...' }],
    [23, { title: 'Introduction to Machine Learning', duration: '15-30min', description: '...' }],
    [24, { title: 'How to Build a Mobile App from Scratch', duration: '<15min', description: '...' }],
    [25, { title: "Exploring the Universe: A Beginner's Guide", duration: '30-45min', description: '...' }],
    [26, { title: 'Fitness for Busy People', duration: '45-60min', description: '...' }],
    [27, { title: 'Eco-Friendly Living Tips', duration: '>60min', description: '...' }],
    [28, { title: 'The Best Workouts for Strength Training', duration: '15-30min', description: '...' }],
    [29, { title: 'How to Stay Fit While Working from Home', duration: '<15min', description: '...' }],
    [30, { title: 'Healthy Meal Prep Ideas', duration: '30-45min', description: '...' }]
]);

export let categoryTableIndex = 10;
// categoryTable(id: number, category: string);
export const categoryTable = new Map([
    [1, { category: "Sports" }],
    [2, { category: "Science" }],
    [3, { category: "Entertainment" }],
    [4, { category: "Education" }],
    [5, { category: "Technology" }],
    [6, { category: "Business" }],
    [7, { category: "Art" }],
    [8, { category: "Lifestyle" }],
    [9, { category: "Music" }],
    [10, { category: "Health" }]
]);

export let videoCategoriesMappingTableIndex = 70;
// videoCategoriesMappingTable(id: number, videoID: number, categoryID: number);
export const videoCategoriesMappingTable = new Map([
    [1, { videoID: 1, categoryID: 1 }],
    [2, { videoID: 1, categoryID: 2 }],
    [3, { videoID: 2, categoryID: 3 }],
    [4, { videoID: 2, categoryID: 4 }],
    [5, { videoID: 2, categoryID: 5 }],
    [6, { videoID: 3, categoryID: 3 }],
    [7, { videoID: 3, categoryID: 6 }],
    [8, { videoID: 4, categoryID: 2 }],
    [9, { videoID: 5, categoryID: 9 }],
    [10, { videoID: 6, categoryID: 3 }],
    [11, { videoID: 7, categoryID: 7 }],
    [12, { videoID: 7, categoryID: 8 }],
    [13, { videoID: 7, categoryID: 6 }],
    [14, { videoID: 8, categoryID: 9 }],
    [15, { videoID: 9, categoryID: 8 }],
    [16, { videoID: 10, categoryID: 1 }],
    [17, { videoID: 10, categoryID: 7 }],
    [18, { videoID: 10, categoryID: 6 }],
    [19, { videoID: 10, categoryID: 4 }],
    [20, { videoID: 11, categoryID: 4 }],
    [21, { videoID: 12, categoryID: 1 }],
    [22, { videoID: 12, categoryID: 5 }],
    [23, { videoID: 12, categoryID: 8 }],
    [24, { videoID: 12, categoryID: 3 }],
    [25, { videoID: 13, categoryID: 9 }],
    [26, { videoID: 13, categoryID: 7 }],
    [27, { videoID: 14, categoryID: 6 }],
    [28, { videoID: 14, categoryID: 10 }],
    [29, { videoID: 14, categoryID: 3 }],
    [30, { videoID: 14, categoryID: 9 }],
    [31, { videoID: 15, categoryID: 9 }],
    [32, { videoID: 15, categoryID: 8 }],
    [33, { videoID: 16, categoryID: 8 }],
    [34, { videoID: 16, categoryID: 3 }],
    [35, { videoID: 16, categoryID: 10 }],
    [36, { videoID: 16, categoryID: 5 }],
    [37, { videoID: 17, categoryID: 3 }],
    [38, { videoID: 17, categoryID: 7 }],
    [39, { videoID: 18, categoryID: 3 }],
    [40, { videoID: 19, categoryID: 10 }],
    [41, { videoID: 19, categoryID: 1 }],
    [42, { videoID: 20, categoryID: 6 }],
    [43, { videoID: 20, categoryID: 2 }],
    [44, { videoID: 20, categoryID: 5 }],
    [45, { videoID: 21, categoryID: 8 }],
    [46, { videoID: 21, categoryID: 4 }],
    [47, { videoID: 21, categoryID: 5 }],
    [48, { videoID: 22, categoryID: 4 }],
    [49, { videoID: 23, categoryID: 7 }],
    [50, { videoID: 23, categoryID: 8 }],
    [51, { videoID: 23, categoryID: 6 }],
    [52, { videoID: 24, categoryID: 5 }],
    [53, { videoID: 24, categoryID: 6 }],
    [54, { videoID: 24, categoryID: 3 }],
    [55, { videoID: 24, categoryID: 4 }],
    [56, { videoID: 25, categoryID: 7 }],
    [57, { videoID: 25, categoryID: 9 }],
    [58, { videoID: 26, categoryID: 2 }],
    [59, { videoID: 26, categoryID: 3 }],
    [60, { videoID: 26, categoryID: 8 }],
    [61, { videoID: 27, categoryID: 2 }],
    [62, { videoID: 27, categoryID: 5 }],
    [63, { videoID: 28, categoryID: 8 }],
    [64, { videoID: 28, categoryID: 9 }],
    [65, { videoID: 28, categoryID: 10 }],
    [66, { videoID: 28, categoryID: 3 }],
    [67, { videoID: 29, categoryID: 2 }],
    [68, { videoID: 30, categoryID: 3 }],
    [69, { videoID: 30, categoryID: 7 }],
    [70, { videoID: 30, categoryID: 5 }]
]);

export let questionTableIndex = 8;
// questionTable(id: number, type: string, question: string);
export const questionTable = new Map([
    [1, { type: "multichoice",   question: "Favorite color?" }],
    [2, { type: "checkbox",      question: "Programming languages?" }],
    [3, { type: "multichoice",   question: "Preferred transport?" }],
    [4, { type: "checkbox",      question: "Hobbies?" }],
    [5, { type: "multichoice",   question: "Favorite season?" }],
    [6, { type: "checkbox",     question: "Languages spoken?" }],
    [7, { type: "multichoice",  question: "Favorite beverage?" }],
    [8, { type: "checkbox",     question: "Sports followed?" }],
]);

export let answerTableIndex = 36;
// answerTable(id: number, questionID: number, text: string);
export const answerTable = new Map([
    [1, { questionID: 1, text: "Red" }],
    [2, { questionID: 1, text: "Blue" }],
    [3, { questionID: 1, text: "Green" }],
    [4, { questionID: 1, text: "Yellow" }],

    [5, { questionID: 2, text: "JS" }],
    [6, { questionID: 2, text: "Python" }],
    [7, { questionID: 2, text: "Java" }],
    [8, { questionID: 2, text: "C++" }],
    [9, { questionID: 2, text: "Ruby" }],

    [10, { questionID: 3, text: "Car" }],
    [11, { questionID: 3, text: "Bike" }],
    [12, { questionID: 3, text: "Train" }],
    [13, { questionID: 3, text: "Plane" }],
    [14, { questionID: 3, text: "Walk" }],

    [15, { questionID: 4, text: "Reading" }],
    [16, { questionID: 4, text: "Gaming" }],
    [17, { questionID: 4, text: "Hiking" }],
    [18, { questionID: 4, text: "Cooking" }],

    [19, { questionID: 5, text: "Spring" }],
    [20, { questionID: 5, text: "Summer" }],
    [21, { questionID: 5, text: "Autumn" }],
    [22, { questionID: 5, text: "Winter" }],

    [23, { questionID: 6, text: "English" }],
    [24, { questionID: 6, text: "Spanish" }],
    [25, { questionID: 6, text: "French" }],
    [26, { questionID: 6, text: "German" }],
    [27, { questionID: 6, text: "Chinese" }],

    [28, { questionID: 7, text: "Coffee" }],
    [29, { questionID: 7, text: "Tea" }],
    [30, { questionID: 7, text: "Soda" }],
    [31, { questionID: 7, text: "Water" }],
    [32, { questionID: 7, text: "Juice" }],

    [33, { questionID: 8, text: "Soccer" }],
    [34, { questionID: 8, text: "Basketball" }],
    [35, { questionID: 8, text: "Tennis" }],
    [36, { questionID: 8, text: "Cricket" }],
]);


export let questionnaireTableIndex = 1;
// questionnaireTable(id: number, name: string, status: string, started: number, completed: number, lastModified: Date, )
export const questionnaireTable = new Map([
    [1, { name: "Survey on Preferences",                 status: "Active",   started: 132,   completed: 110,     lastModified: "2025-03-21" }],
]);

export let question_questionnaireTableIndex = 8;
// question_questionnaireTable(id: number, questionID: number, questionnaireID: number);
export const question_questionnaireTable = new Map([
    [1, { questionID: 1, questionnaireID: 1 }],
    [2, { questionID: 2, questionnaireID: 1 }],
    [3, { questionID: 3, questionnaireID: 1 }],
    [4, { questionID: 4, questionnaireID: 1 }],
    [5, { questionID: 5, questionnaireID: 1 }],
    [6, { questionID: 6, questionnaireID: 1 }],
    [7, { questionID: 7, questionnaireID: 1 }],
    [8, { questionID: 8, questionnaireID: 1 }],
]);

export let answer_categoryMappingTableIndex = 11;
// response_mappingTable(id: number, questionnaire_id: number, answer_id: number, category_id: number, inclusive: boolean)
export const answer_categoryMappingTable = new Map([
    [1, { questionnaireID: 1, answerID: 1, categoryID: 1, inclusive: true  }],
    [2, { questionnaireID: 1, answerID: 1, categoryID: 2, inclusive: true  }],
    [3, { questionnaireID: 1, answerID: 2, categoryID: 3, inclusive: true  }],
    [4, { questionnaireID: 1, answerID: 3, categoryID: 4, inclusive: true  }],
    [5, { questionnaireID: 1, answerID: 4, categoryID: 5, inclusive: true  }],
    [6, { questionnaireID: 1, answerID: 5, categoryID: 6, inclusive: true  }],
    [7, { questionnaireID: 1, answerID: 6, categoryID: 7, inclusive: true  }],
    [8, { questionnaireID: 1, answerID: 7, categoryID: 8, inclusive: true  }],
    [9, { questionnaireID: 1, answerID: 8, categoryID: 9, inclusive: true  }],
    [10, { questionnaireID: 1, answerID: 9, categoryID: 10, inclusive: true  }],
    [11, { questionnaireID: 1, answerID: 10, categoryID: 10, inclusive: true  }],
]);

  
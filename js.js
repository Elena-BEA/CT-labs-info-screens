// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
// const URL = "./my-pose-model(3)/";
const URL = "./my-pose-model_up/";

let model, webcam, ctx, labelContainer, maxPredictions;
var id = 0;
// const carousel = new bootstrap.Carousel('#myCarousel');
var previousClassName = "Nothing";

let previousPrediction;
    let predictionTime = 3000;
    let predictionDuration = 0;

    let slidesFolder = "./images/";
    let slides = ["Home.png", "MS_facilities.png", "MS_student_assistants.png", "MS_events.png", "MS_student_work1.png", "MS_student_work2.png", "MS_student_work3.png",
     "SL_student_work2.png", "SL_student_work1.png", , "SL_events.png", , "SL_student_assistants.png", "SL_VR_games.png" ,"SL_facilities.png"];
    let slideIndex = 0;
    let slide;

    let timeOfPrediction = new Date().getTime();
    let hasSwitched = false;


// const myCarouselElement = document.querySelector('#myCarousel')
//         const carousel = new bootstrap.Carousel(myCarouselElement, {
//             setInterval: false,
//             wrap: false,
//         });

// $('.carousel').carousel({
//     interval: false,
// })


// const myCarousel = document.getElementById('myCarousel')

// function updateID(carcar){
//     carcar.addEventListener('slide.bs.carousel', function(e) {
//         id = e.from;
//         console.log(id + 'id of the CURRENT slide');
//     });
// };

// myCarousel.addEventListener('slide.bs.carousel', function(e) {
//     id = e.from;
//     console.log(id + 'id of the CURRENT slide')
// })

// function goToSlide(number) {
//     console.log('goToSlide :' + number)
//     $('#myCarousel').carousel(parseInt(number));
//  };

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    // Convenience function to setup a webcam
    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    labelContainer = document.getElementById("label-container");
    slide = document.getElementById("slide");
    bar = document.querySelector(".progress-bar");
    
    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
    // setInterval(loop,2000);
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
    //setTimeout(loop,2000);
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);
    
    
    for (let i = 0; i < maxPredictions; i++) {
        
        let maxValue = 0;
        let className = "";
        
        for (let i = 0; i < maxPredictions; i++) {
            if (prediction[i].probability > maxValue) {
                maxValue = prediction[i].probability;
                className = prediction[i].className;
            }
            
            // const classPrediction =
            //     prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            // labelContainer.childNodes[i].innerHTML = classPrediction;
        }
        
        // if (className == previousClassName)
        // {
        //     // don't need to do anything, className was already in the previous frame
        // }else if(className == "Right"){
        //     // setTimeout(()=> switchRight(className, carousel));
        //     // console.log("slide id is ################" + id);
        //     // console.log("right")
        //     switchRight(className,carousel);
        //     // slideIndex = $('#myCarousel .active').index('#myCarousel .item');
        //     // console.log(slideIndex);
        // }else if (className = "Left"){
        //     // console.log("slide id is ################" + id);
        //     // setTimeout(() => switchLeft(className, carousel), 1000);
        //     // console.log("left")
        //     switchLeft(className, carousel);
        //     // slideIndex = $('#myCarousel .active').index('#myCarousel .item');
        //     // console.log(slideIndex);
        // }else if(className = "Nothing"){
        //     // setTimeout(()=> doNothing(className, carousel), 1000);
        //     // console.log("nothing")
        //     doNothing(className, carousel);
        // }
        previousClassName = className;

        labelContainer.innerHTML = className;
        predictionToInput(className);

        // finally draw the poses
        drawPose(pose);
    }


    function predictionToInput(prediction){

        // new prediction
        if(previousPrediction != prediction)
        {
            timeOfPrediction = new Date().getTime();
            previousPrediction = prediction;
            hasSwitched = false;
            bar.style.width = 0 + "%";
        }
        else if(new Date().getTime() - timeOfPrediction > 1000 && !hasSwitched)
        {
            let newPredictionTime = new Date().getTime();
            input(prediction);
            hasSwitched = true;
            bar.style.width = (newPredictionTime - timeOfPrediction)/10 + "%";
        }
    }

    function input(prediction)
    {
       switch(prediction)
       {
            case "Right":
                slideIndex = (slideIndex + 1) % slides.length;
                bar.innerText = "right";
                console.log(`next, ${slideIndex}`);
                break;
            case "Left":
                slideIndex -= 1;
                if(slideIndex < 0) slideIndex = slides.length - 1;
                bar.innerText = "left";
                console.log(`prev, ${slideIndex}`);
                break;
            case "Up":
                if(slideIndex =! 0) slideIndex = 0;
                bar.innerText = "home";
                console.log(`home, ${slideIndex}`);
                break;
       }

       if(slideIndex == 6 && prediction == "Right") slideIndex = 0;
       if(slideIndex == 7 && prediction == "Left") slideIndex = 0;
       slide.setAttribute("src", slidesFolder + slides[slideIndex]);
    }
    

    // function switchLeft(className, carousel){
    //     //updateID(myCarousel);
    //     id = id - 1;
    //     if (id < 0) id = 0;
    //     goToSlide(id);

    //     // setTimeout(() => carousel.to(1), 1000);
    //     document.getElementById("body").style.backgroundColor = "#00FF00";
    // }

    // function switchRight(className, carousel){
    //     //updateID(myCarousel);
    //     document.getElementById("body").style.backgroundImage = "url('Spacelab_BG.png')";
    //     id = id + 1;
    //     if (id > 2) id = 2;
    //     goToSlide(id + 1);
    //     // setTimeout(() => carousel.to(2), 1000);
    //     // document.getElementById("body").style.backgroundColor = "red";
    // }
    // function doNothing(className, carousel) {
    //     document.getElementById("body").style.backgroundColor = "#FFFFFF";
    //     console.log("Nothing");
    // }

    function drawPose(pose) {
        if (webcam.canvas) {
            ctx.drawImage(webcam.canvas, 0, 0);
            // draw the keypoints and skeleton
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
        }
    }
}
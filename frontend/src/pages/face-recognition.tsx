import React from "react";
import FaceRecognition from "@/components/FaceRecognition";

const FaceRecognitionPage: React.FC = () => {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Live Face Recognition</h1>
      <FaceRecognition />
    </div>
  );
};

export default FaceRecognitionPage;

import React, { useCallback, useState } from 'react';
import CameraPage from './CameraPage';
import DescriptionPage from './DescriptionPage';
import GenerationPage from './GenerationPage';

type Step = 'camera' | 'description' | 'generation';

interface UploadStackProps {
  isActive: boolean;
  onCompleteToDetail: (imageData: string | null) => void;
}

const UploadStack: React.FC<UploadStackProps> = ({ isActive, onCompleteToDetail }) => {
  const [step, setStep] = useState<Step>('camera');
  const [imageData, setImageData] = useState<string | null>(null);

  const handlePhotoTaken = useCallback((img: string) => {
    setImageData(img);
    setStep('description');
  }, []);

  const handleNext = useCallback(() => {
    setStep('generation');
  }, []);

  const handleGenerationComplete = useCallback(() => {
    onCompleteToDetail(imageData);
  }, [imageData, onCompleteToDetail]);

  return (
    <div className="w-full h-full">
      {step === 'camera' && (
        <CameraPage isActive={isActive} onPhotoTaken={handlePhotoTaken} />
      )}
      {step === 'description' && (
        <DescriptionPage onNext={handleNext} artworkImage={imageData ?? undefined} />
      )}
      {step === 'generation' && (
        <GenerationPage onCaptured={handleGenerationComplete} />
      )}
    </div>
  );
};

export default UploadStack;


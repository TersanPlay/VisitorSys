import React from 'react';
import Webcam from 'react-webcam';
import { Camera, User, X, Check } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner'; // Ajuste o caminho se necessário

const PhotoCaptureSection = ({
  capturedImage,
  setCapturedImage, // Adicionado para permitir limpar a imagem ou atualizar após retake
  showCamera,
  setShowCamera,
  openCamera,
  webcamRef,
  selectedCameraId,
  setSelectedCameraId,
  availableCameras,
  capturePhoto,
  isCapturing,
  cameraLoading,
  setPhotoError, // Para o onUserMediaError
  retakePhoto,
  faceDetected,
  photoError,
  errors,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
      <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Foto do Visitante (Opcional)</h3>
      {!capturedImage && !showCamera && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-48 w-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <User className="h-24 w-24 text-gray-300 dark:text-gray-500" />
          </div>
          <button
            type="button"
            onClick={openCamera}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Camera className="h-4 w-4 mr-2" />
            Abrir Câmera
          </button>
        </div>
      )}

      {showCamera && (
        <div className="space-y-4">
          {cameraLoading ? (
            <div className="flex justify-center items-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <div className="relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  deviceId: selectedCameraId,
                  facingMode: 'user'
                }}
                className="w-full rounded-lg"
                onUserMediaError={(error) => {
                  console.error('Erro ao acessar câmera:', error);
                  setPhotoError(`Erro ao acessar câmera: ${error.message || 'Verifique se a câmera está conectada e funcionando'}. Como a foto é opcional, você pode continuar o cadastro sem ela.`);
                  setShowCamera(false);
                }}
              />
              {availableCameras.length > 1 && (
                <div className="absolute bottom-2 right-2">
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="text-xs bg-gray-800 bg-opacity-75 text-white rounded px-2 py-1"
                  >
                    {availableCameras.map((camera) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Câmera ${camera.deviceId.slice(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isCapturing || cameraLoading}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCapturing ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar Foto
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowCamera(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="w-full rounded-lg"
            />
            {faceDetected && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={retakePhoto} // Usa o retakePhoto passado por props
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Camera className="h-4 w-4 mr-2" />
            Tirar Nova Foto
          </button>
        </div>
      )}

      {photoError && (
        <p className="text-sm text-red-600 dark:text-red-500">{photoError}</p>
      )}
      {errors && errors.photo && ( // Adicionado verificação para errors
        <p className="text-sm text-red-600 dark:text-red-500">{errors.photo}</p>
      )}
    </div>
  );
};

export default PhotoCaptureSection;
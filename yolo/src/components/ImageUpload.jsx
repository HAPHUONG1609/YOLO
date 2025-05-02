function ImageUpload({ onImageUpload }) {
    const handleChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        onImageUpload(file);
      }
    };
  
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="imageUpload">
          Upload an Image
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
    );
  }
  
  export default ImageUpload;
// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to important DOM elements
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const convertBtn = document.getElementById('convertBtn');
    const uploadArea = document.querySelector('.upload-area');

    // Array to store selected image files
    let images = [];

    // Add event listener for file input changes
    imageInput.addEventListener('change', handleFileSelect);

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '#ecf0f1'; // Change background color on dragover
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = ''; // Reset background color on dragleave
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = ''; // Reset background color on drop
        // Handle dropped files as if they were selected through the file input
        handleFileSelect({ target: { files: e.dataTransfer.files } });
    });

    // Function to handle file selection (both from input and drag-and-drop)
    function handleFileSelect(e) {
        // Filter out non-image files
        images = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        updateImagePreview();
        // Disable the convert button if no images are selected
        convertBtn.disabled = images.length === 0;
    }

    // Function to update the image preview area
    function updateImagePreview() {
        imagePreview.innerHTML = ''; // Clear existing preview
        images.forEach(image => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(image); // Create a URL for the image file
            imagePreview.appendChild(img);
        });
    }

    // Add event listener for the convert button
    convertBtn.addEventListener('click', () => {
        if (images.length === 0) {
            alert('Please select at least one image.');
            return;
        }

        // Create a new PDF document
        const pdf = new jspdf.jsPDF();
        let currentPage = 0;

        // Recursive function to add images to the PDF
        function addImageToPDF() {
            if (currentPage >= images.length) {
                pdf.save('converted_images.pdf'); // Save the PDF when all images are added
                return;
            }

            const img = new Image();
            img.src = URL.createObjectURL(images[currentPage]);
            img.onload = () => {
                // Calculate dimensions to fit the image on the PDF page
                const imgProps = pdf.getImageProperties(img);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pdfWidth;
                const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                // Add the image to the PDF
                pdf.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
                currentPage++;

                if (currentPage < images.length) {
                    pdf.addPage(); // Add a new page for the next image
                    addImageToPDF(); // Process the next image
                } else {
                    pdf.save('converted_images.pdf'); // Save the PDF when all images are added
                }
            };
        }

        // Start the PDF creation process
        addImageToPDF();
    });
});
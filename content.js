(() => {
  console.log("Content script loaded!");

  /**
   * Fetch all `.jpg` links from the parent directory
   * @param {string} parentUrl - URL of the parent directory
   * @returns {Promise<string[]>} - Array of image URLs
   */
  async function fetchLinksFromParent(parentUrl) {
    try {
      const response = await fetch(parentUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      // Extract `.jpg` links from the parent directory
      return Array.from(doc.querySelectorAll("a"))
        .filter((link) => link.href.endsWith(".jpg"))
        .map((link) => link.href);
    } catch (error) {
      console.error("Failed to fetch parent directory links:", error);
      return [];
    }
  }

  const currentUrl = window.location.href;
  const parentUrl = new URL(".", currentUrl).href;

  let links = [];
  let currentIndex = 0;

  async function initializeGallery() {
    // If the current URL is a `.jpg` link, fetch links from the parent folder
    if (currentUrl.endsWith(".jpg")) {
      links = await fetchLinksFromParent(parentUrl);

      // Find the current image in the links array
      currentIndex = links.indexOf(currentUrl);
      if (currentIndex === -1) currentIndex = 0; // Default to the first image
    } else {
      // Fetch `.jpg` links from the current page
      links = Array.from(document.querySelectorAll("a"))
        .filter((link) => link.href.endsWith(".jpg"))
        .map((link) => link.href);

      currentIndex = 0; // Start from the first image
    }


    // Ensure there are images to display
    if (links.length === 0) {
      console.log("No images found.");
      return;
    }

    openModal(currentIndex);
  }

  // Ensure the modal is created only once
  let modal = document.getElementById("image-gallery-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "image-gallery-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "10000";
    modal.style.visibility = "hidden";

    const modalImage = document.createElement("img");
    modalImage.id = "modal-image";
    modalImage.style.maxWidth = "90%";
    modalImage.style.maxHeight = "90%";
    modalImage.style.border = "3px solid white";
    modal.appendChild(modalImage);

    const positionIndicator = document.createElement("div");
    positionIndicator.id = "position-indicator";
    positionIndicator.style.position = "absolute";
    positionIndicator.style.bottom = "10%";
    positionIndicator.style.left = "50%";
    positionIndicator.style.transform = "translateX(-50%)";
    positionIndicator.style.color = "white";
    positionIndicator.style.fontSize = "18px";
    positionIndicator.style.fontFamily = "Arial, sans-serif";
    positionIndicator.style.textShadow = "1px 1px 2px black";
    modal.appendChild(positionIndicator);

    const imagePathDisplay = document.createElement("div");
    imagePathDisplay.id = "image-path-display";
    imagePathDisplay.style.position = "absolute";
    imagePathDisplay.style.bottom = "5%";
    imagePathDisplay.style.left = "50%";
    imagePathDisplay.style.transform = "translateX(-50%)";
    imagePathDisplay.style.color = "white";
    imagePathDisplay.style.fontSize = "14px";
    imagePathDisplay.style.fontFamily = "Arial, sans-serif";
    imagePathDisplay.style.textShadow = "1px 1px 2px black";
    modal.appendChild(imagePathDisplay);

    const leftArrow = document.createElement("div");
    leftArrow.textContent = "◀";
    leftArrow.style.position = "absolute";
    leftArrow.style.left = "20px";
    leftArrow.style.top = "50%";
    leftArrow.style.transform = "translateY(-50%)";
    leftArrow.style.color = "white";
    leftArrow.style.fontSize = "30px";
    leftArrow.style.cursor = "pointer";
    leftArrow.style.userSelect = "none";
    modal.appendChild(leftArrow);

    const rightArrow = document.createElement("div");
    rightArrow.textContent = "▶";
    rightArrow.style.position = "absolute";
    rightArrow.style.right = "20px";
    rightArrow.style.top = "50%";
    rightArrow.style.transform = "translateY(-50%)";
    rightArrow.style.color = "white";
    rightArrow.style.fontSize = "30px";
    rightArrow.style.cursor = "pointer";
    rightArrow.style.userSelect = "none";
    modal.appendChild(rightArrow);

    const closeButton = document.createElement("div");
    closeButton.textContent = "✖";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "20px";
    closeButton.style.color = "white";
    closeButton.style.fontSize = "30px";
    closeButton.style.cursor = "pointer";
    closeButton.style.userSelect = "none";
    closeButton.style.textShadow = "1px 1px 2px black";
    modal.appendChild(closeButton);

    document.body.appendChild(modal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    leftArrow.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + links.length) % links.length;
      updateModal();
    });

    rightArrow.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % links.length;
      updateModal();
    });

    closeButton.addEventListener("click", () => {
      closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (modal.style.visibility === "visible") {
        const largeStep = event.shiftKey || event.key === "S" || event.key === "s";
        if (event.key === "ArrowRight" && largeStep) {
          currentIndex = (currentIndex + 100) % links.length;
          updateModal();
        } else if (event.key === "ArrowLeft" && largeStep) {
          currentIndex = (currentIndex - 100 + links.length) % links.length;
          updateModal();
        } else if (event.key === "ArrowRight") {
          currentIndex = (currentIndex + 1) % links.length;
          updateModal();
        } else if (event.key === "ArrowLeft") {
          currentIndex = (currentIndex - 1 + links.length) % links.length;
          updateModal();
        } else if (event.key === "Escape") {
          closeModal();
        }
      }
    });
  }

  function updateModal() {
    const modalImage = document.getElementById("modal-image");
    const positionIndicator = document.getElementById("position-indicator");
    const imagePathDisplay = document.getElementById("image-path-display");

    modalImage.src = links[currentIndex];
    positionIndicator.textContent = `${currentIndex} / ${links.length - 1}`;
    imagePathDisplay.textContent = links[currentIndex];
  }

  function openModal(index) {
    currentIndex = index;
    updateModal();
    modal.style.visibility = "visible";
  }

  function closeModal() {
    modal.style.visibility = "hidden";
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openGallery") {
      console.log("Opening gallery...");
      initializeGallery();
      sendResponse({ status: "Gallery opened" });
    }
  });
})();
$(document).ready(function () {
  const $canvas = $("#canvas");
  let isDrawMode = false;
  let customPolygonPoints = [];
  let svgCanvas = null;

  // show button when drawing three points or more
  const drawPolygonBtn = $("#confirmPolygon");

  // button delete all draw
  const clearBtn = $("#clearCanvas");

  // Enable and disable drawing mode
  $("#drawMode").on("click", () => {
    isDrawMode = !isDrawMode;
    alert("Draw Mode is " + (isDrawMode ? "ON" : "OFF"));
    $("#shapeType").val("polygon");
    if (!isDrawMode) {
      $drawPolygonBtn.addClass("d-none");
      customPolygonPoints = [];
    }
  });

  // Clear all drawings button
  clearBtn.on("click", () => {
    // Delete all elements inside the canvas (including SVG) except the form and buttons.
    $canvas
      .find("*")
      .not("#shapeForm, #drawMode, #confirmPolygon, #clearCanvas")
      .remove();

    svgCanvas = null;
    customPolygonPoints = [];
    drawPolygonBtn.addClass("d-none");

    // Reset values in form after clearing
    $("#shapeType").val("");
  });

  // Draw polygon button
  drawPolygonBtn.on("click", function () {
    createShape("polygon", 0, $("#shapeColor").val(), 0, 0);
  });

  // Create a canvas for SVG
  function ensureSVGCanvas() {
    if (!svgCanvas) {
      const $svgWrapper = $('<div id="svg-wrapper"></div>').css({
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      });
      $canvas.prepend($svgWrapper);
      svgCanvas = SVG().addTo("#svg-wrapper").size("100%", "100%");
    }
  }

  //(important!) I'm not using arrow functions because I want to call this function from outside before its definition.
  // Creates a polygon on the SVG canvas using given points, size, and color.
  function createShape(type, size, color, x, y) {
    // Check if the shape is a polygon and if there are at least 3 points in the customPolygonPoints array
    if (type === "polygon" && customPolygonPoints.length >= 3) {
      // Ensure that the SVG canvas is ready for drawing
      ensureSVGCanvas();

      const pointStr = customPolygonPoints
        .map((p) => `${p.x},${p.y}`)
        .join(" "); // Join all points into a single string separated by spaces

      svgCanvas.polygon(pointStr).fill(color);

      customPolygonPoints = [];

      // Hide the "Draw Polygon" button
      drawPolygonBtn.addClass("d-none");
      return;
    }

    // Creates a new shape element, applies classes and styles to position it absolutely on the page.
    const $shape = $("<div>")
      .addClass("shape " + type)
      .css({
        position: "absolute",
        left: x + "px",
        top: y + "px",
        zIndex: 1,
      });

    // Apply styles based on the shape type
    if (type === "circle") {
      $shape.css({
        width: size + "px",
        height: size + "px",
        borderRadius: "50%",
        backgroundColor: color,
      });
    } else if (type === "square") {
      $shape.css({
        width: size + "px",
        height: size + "px",
        backgroundColor: color,
      });
    } else if (type === "triangle") {
      $shape.css({
        width: 0,
        height: 0,
        borderLeft: size / 2 + "px solid transparent",
        borderRight: size / 2 + "px solid transparent",
        borderBottom: size + "px solid " + color,
        backgroundColor: "transparent",
      });
    }

    // Add the created shape (circle, square, etc.) to the canvas
    $canvas.append($shape);

    // Make the shape draggable by adding mouse event listeners to move the shape around
    makeDraggable($shape);

    // Use GSAP to animate the shape, starting from scale 0 (invisible) and scaling it to normal size over 0.5 seconds
    gsap.from($shape[0], { scale: 0, duration: 0.5 });
  }

  function makeDraggable($el) {
    let isDragging = false;
    let startX, startY;
    let initialMouseX, initialMouseY;

    // Helper function to handle both mouse and touch events
    const getClientCoordinates = (event) => {
      if (event.type.includes("touch")) {
        return {
          clientX: event.touches[0].clientX,
          clientY: event.touches[0].clientY,
        };
      } else {
        return {
          clientX: event.clientX,
          clientY: event.clientY,
        };
      }
    };

    // Start dragging
    $el.on("mousedown touchstart", (e) => {
      e.preventDefault();
      isDragging = true;

      const { clientX, clientY } = getClientCoordinates(e);

      startX = $el.position().left;
      startY = $el.position().top;
      initialMouseX = clientX;
      initialMouseY = clientY;

      $el.css("cursor", "grabbing");

      // Add visual feedback for touch
      if (e.type === "touchstart") {
        $el.css("opacity", "0.8");
      }
    });

    // Dragging movement
    $(document).on("mousemove touchmove", (e) => {
      if (!isDragging) return;

      const { clientX, clientY } = getClientCoordinates(e);

      const deltaX = clientX - initialMouseX;
      const deltaY = clientY - initialMouseY;

      $el.css({
        left: startX + deltaX + "px",
        top: startY + deltaY + "px",
      });
    });

    // Stop dragging
    $(document).on("mouseup touchend", () => {
      if (isDragging) {
        isDragging = false;
        $el.css("cursor", "grab");
        $el.css("opacity", "1");
      }
    });

    // Prevent default drag behavior
    $el.on("dragstart", () => false);
  }

  // Create regular shapes
  $("#shapeForm").on("submit", (e) => {
    e.preventDefault();

    // Get the shape type, size (integer), and color from the form inputs
    const type = $("#shapeType").val();
    const size = parseInt($("#shapeSize").val());
    const color = $("#shapeColor").val();
    // Generate random coordinates for the shape (x, y) ensuring they stay within the canvas bounds
    const x = Math.floor(Math.random() * ($canvas.width() - size));
    const y = Math.floor(Math.random() * ($canvas.height() - size));
    // Call the createShape function to create the shape with the specified properties
    createShape(type, size, color, x, y);
  });

  // Scoring in Draw Mode
  $canvas.on("click touchstart", function (e) {
    // If draw mode is off (isDrawMode == false), do nothing
    if (!isDrawMode) return;

    // Prevent default behavior for touch events to avoid scrolling
    if (e.type === "touchstart") {
      e.preventDefault();
    }

    // Get the offset of the canvas relative to the document to calculate coordinates accurately
    const offset = $canvas.offset();

    // Handle both mouse and touch events
    const pageX = e.type === "touchstart" ? e.touches[0].pageX : e.pageX;
    const pageY = e.type === "touchstart" ? e.touches[0].pageY : e.pageY;

    // Calculate the actual coordinates of the clicked point based on where the user clicked within the canvas
    const x = pageX - offset.left;
    const y = pageY - offset.top;

    // Create touch indicator effect
    const $indicator = $('<div class="touch-indicator"></div>').css({
      left: x + "px",
      top: y + "px",
    });

    $canvas.append($indicator);

    setTimeout(() => {
      $indicator.remove();
    }, 500);

    // Ensure that we have an SVG canvas set up for drawing shapes
    ensureSVGCanvas();

    // Draw a small circle at the clicked point (6px diameter)
    svgCanvas
      .circle(6)
      .fill($("#shapeColor").val())
      .move(x - 3, y - 3);

    // Push the point into the customPolygonPoints array for later use in polygon creation
    customPolygonPoints.push({ x, y });

    // If 3 or more points have been collected, show the "Draw Polygon" button
    if (customPolygonPoints.length >= 3) drawPolygonBtn.removeClass("d-none");
  });
});

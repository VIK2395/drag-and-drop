'use strict'

document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector(".container");
  const listItems = Array.from(document.querySelectorAll(".list-item")); // Array of elements
  const gap     = 7;
  const sortables = listItems.map(Sortable); // Array of sortables
  let total     = sortables.length;

  gsap.to(container, {
    duration: 0.5,
    autoAlpha: 1
  });

  function changeIndex(item, to) {
    // Change position in array
    arrayMove(sortables, item.index, to);
    // Set index for each sortable
    sortables.forEach((sortable, index) => sortable.setIndex(index));
  }

  function Sortable(element, index) {
      
    let content = element.querySelector(".item-content");
    let order   = element.querySelector(".order");
    
    let animation = gsap.to(content, {
      duration: 0.3,
      boxShadow: "rgba(0,0,0,0.2) 0px 16px 32px 0px",
      force3D: true,
      scale: 1.1,
      paused: true
    });

    let [dragger] = Draggable.create(element, {
      onDragStart: downAction,
      onRelease: upAction,
      onDrag: dragAction,
      cursor: "inherit",    
      type: "x,y"
    });

    // Public properties and methods
    let sortable = {
      dragger:  dragger,
      element:  element,
      startIndex: null,
      index:    index,
      setIndex: setIndex,
      location: {
        y: null,
        height: null,
        topBound: null,
        bottomBound: null
      }
    };

    setInitY();
    function setInitY() {
      sortable.location.y = listItems.slice(0, index).reduce((acc, elem) => acc + elem.getBoundingClientRect().height + gap, 0);
    }

    setInitHeight();
    function setInitHeight() {
      sortable.location.height = listItems[sortable.index].getBoundingClientRect().height;
    }

    setInitBounds();
    function setInitBounds() {
      if (index === 0) {
        sortable.location.topBound = null
      } else {
        sortable.location.topBound = sortable.location.y - gap - listItems[sortable.index - 1].getBoundingClientRect().height / 2;
      }
      if (index === listItems.length - 1) {
        sortable.location.bottomBound = null
      } else {
        sortable.location.bottomBound = sortable.location.y + gap + listItems[sortable.index + 1].getBoundingClientRect().height / 2;
      }
    }
    
    gsap.set(element, {
      x: 0,
      y: sortable.location.y
    });
      
    function setIndex(index) {
      if (sortable.index !== index) {

        sortable.index = index;    
        order.textContent = index + 1;
        setY();
        setBounds();
        
        // Don't layout elem if it being dragged
        if (!dragger.isDragging) layout();
      }
    }

    function setY() {
      if (sortable.index === 0) {
        sortable.location.y = 0;
      } else {
        sortable.location.y = sortables[sortable.index - 1].location.y + sortables[sortable.index - 1].location.height + gap;
      }
    }

    function setBounds() {
      if (sortable.index === 0) {
        sortable.location.topBound = null;
      } else {
        sortable.location.topBound = sortable.location.y - gap - sortables[sortable.index - 1].location.height / 2;
      }
      if (sortable.index === total - 1) {
        sortable.location.bottomBound = null;
      } else {
        sortable.location.bottomBound = sortable.location.y + gap + sortables[sortable.index + 1].location.height / 2;
      }
    }

    // //setHeight();
    // function setHeight() {
    //   sortable.location.height = sortable.element.getBoundingClientRect().height;
    // }

    // function upadateOnHeightChange()) {
    //   sortables.forEach(() => {
    //     setY();
    //     setHeight();
    //     setBounds();
    //   })
    // }
    
    function dragAction() {
      if (sortable.index !== 0) {
        if (this.y < sortable.location.topBound) {
          changeIndex(sortable, sortable.index - 1);
        };
      }
      if (sortable.index !== total - 1) {
        if (this.y > sortable.location.bottomBound) {
          changeIndex(sortable, sortable.index + 1);
        };
      }
    }

    function downAction() {
      sortable.startIndex = sortable.index;
      animation.play();
      this.update();
    }
    
    function upAction() {
      //Change element's position in DOM
      if (sortable.index === total - 1) {
        container.appendChild(sortable.element);
      } else {   
        const i = sortable.startIndex > sortable.index ? sortable.index : sortable.index + 1;
        container.insertBefore(sortable.element, container.children[i]);
      }

      animation.reverse();
      layout();
    }
    
    function layout() {
      gsap.to(element, {
        duration: 0.3,
        x: 0,
        y: sortable.location.y
      });  
    }
      
    return sortable;
  }

  // Changes an elements's position in array
  function arrayMove(array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0]);
  }

})
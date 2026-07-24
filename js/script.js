
  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-'+tab.dataset.tab).classList.add('active');
    });
  });

  // Duplicate a blank card when "+ Añadir" is clicked
  function duplicateCard(cat){
    const panel = document.getElementById('panel-'+cat);
    const grid = panel.querySelector('.grid-products');
    const addCard = grid.querySelector('.add-card');
    const template = grid.querySelector('.card');
    const clone = template.cloneNode(true);
    clone.querySelectorAll('.editable').forEach(el=>{
      if(el.classList.contains('card-price')) el.textContent = '$ 0';
      else if(el.classList.contains('card-stock')) el.textContent = 'Stock: --';
      else el.textContent = 'Nombre del producto';
    });
    grid.insertBefore(clone, addCard);
    updateCount(cat);
  }

  function updateCount(cat){
    const panel = document.getElementById('panel-'+cat);
    const total = panel.querySelectorAll('.card').length;
    panel.querySelector('.count strong').textContent = total;
  }

  // initialize counts
  ['ropa','accesorios','perfumes','zapatos'].forEach(updateCount);

  /* carrusel */
  document.querySelectorAll(".card").forEach(card=>{

    const gallery = card.querySelector(".product-gallery");

    if(!gallery) return;

    const images = gallery.querySelectorAll(".product-img");

    let current = 0;
    let interval;


    card.addEventListener("mouseenter",()=>{

        clearInterval(interval);

        interval = setInterval(()=>{

            current++;

            gallery.style.transition="transform .6s cubic-bezier(.22,.61,.36,1)";
            gallery.style.transform=`translateX(-${current * 100}%)`;


            if(current === images.length - 1){

                setTimeout(()=>{

                    gallery.style.transition="none";

                    current=0;

                    gallery.style.transform="translateX(0%)";


                    setTimeout(()=>{

                        gallery.style.transition="transform .6s cubic-bezier(.22,.61,.36,1)";

                    },50);


                },600);

            }


        },1000);


    });


    card.addEventListener("mouseleave",()=>{

        clearInterval(interval);

        current=0;

        gallery.style.transition="transform .6s cubic-bezier(.22,.61,.36,1)";
        gallery.style.transform="translateX(0%)";

    });


});
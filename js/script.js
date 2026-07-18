
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
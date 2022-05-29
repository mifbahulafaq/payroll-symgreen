const inpByrKasbon = document.querySelectorAll('.formBayar .currency');
inpByrKasbon.forEach(e=>{
 
  e.addEventListener('input',()=>{
    const btnFormBayar = e.parentNode.querySelector('.btnFormBayar');
    const regex = /[^,\d]/g;
    const nilaiInp = Number(e.value.replace(regex, ''));
    const sisa = Number(e.dataset.sisa);
    if(nilaiInp>sisa){
        e.style.color = 'red';
        btnFormBayar.setAttribute('type','button');
    }else{
        e.style.color = '';
        btnFormBayar.setAttribute('type','submit');
    }
  })
  
})

  $(document).ready(function () {
    bsCustomFileInput.init();
  });

  const sidebarMini = document.querySelector('.sidebar-mini');
  const btnSidebarMini = document.querySelector('.btnSidebarMini');

  btnSidebarMini.addEventListener('click',function(){
    sidebarMini.classList.toggle('sidebar-collapse');
  })

  const bayarKasbon = document.querySelectorAll('.bayarKasbon');
  bayarKasbon.forEach(e=>{
    e.addEventListener('click',function(){
      const parent = this.parentNode.parentNode;
      parent.querySelector('.formBayar').removeAttribute('style');
      parent.querySelector('.aksi').setAttribute('style','display: none;');

    })
  });

  const kembaliFormKasbon = document.querySelectorAll('.kembaliFormKasbon');
  kembaliFormKasbon.forEach(e=>{
    e.addEventListener('click',function(){
      const parent = this.parentNode.parentNode.parentNode;
      parent.querySelector('.formBayar').setAttribute('style','display: none;');
      parent.querySelector('.aksi').removeAttribute('style');
    })
  })

  const input = document.querySelectorAll('.input')
  const currency = document.querySelectorAll('.currency')
  let rLembur = document.querySelector('.rLembur')
  let rGaji = document.querySelector('.rGaji')

  function rupiah(element){

    const numb = element.value.replace(/[^,\d]/g, '')//regex tsb untuk mengambil string kecuali number
    if(numb){
      const sisa = numb.length % 3
      let rupiah = numb.substr(0,sisa)
      let ribu = numb.substr(sisa).match(/\d{3}/gi)//the method match() retrieves the result ofmatching a string against a regex, and become a array
      separator = sisa && numb.length > 3?'.':'';
        
      if(ribu){
        rupiah+=separator+ribu.join('.');
      }
      element.value = rupiah;
    }

  }

  // function hitung(){
  //   let arr = []
  //     input.forEach(e=>{
  //     let input2 = e.value.replace(/[^,\d]/g,'')
  //     arr.push(input2)
  //     })

  //     let [gajiPokok,masukPerHari,lemburPerjam,insentif,uangMakan,lainLain] = arr

  //     let resultLembur = Number(lemburPerjam) * (Number(gajiPokok) / 7 )
  //     rLembur.value = Math.floor(resultLembur)
  //     let resultGaji =  (Number(masukPerHari) * (Number(gajiPokok)+Number(insentif)+Number(uangMakan))) + resultLembur + Number(lainLain)
  //     rGaji.value = Math.floor(resultGaji)
  //     if(rLembur.value){ rupiah(rLembur) }
  //     if(rGaji.value){rupiah(rGaji)}
  // }


  currency.forEach(e=>{
    if(e.value) rupiah(e)
    e.addEventListener('keyup',function(){
      rupiah(this)
    })
  })

  // input.forEach(e => {
  //   if(e.value) hitung()
  //   e.addEventListener('keyup',()=>{
  //     hitung()
  //   })
  // })



  $(function () {
    //Initialize Select2 Elements
    $('.select2').select2()

    //Initialize Select2 Elements
    $('.select2bs4').select2({
      theme: 'bootstrap4'
    })

    //Datemask dd/mm/yyyy
    $('#datemask').inputmask('dd/mm/yyyy', { 'placeholder': 'dd/mm/yyyy' })
    //Datemask2 mm/dd/yyyy
    $('#datemask2').inputmask('mm/dd/yyyy', { 'placeholder': 'mm/dd/yyyy' })
    //Money Euro
    $('[data-mask]').inputmask()

    //Date range picker
    $('#reservation').daterangepicker()
    //Date range picker with time picker
    $('#reservationtime').daterangepicker({
      timePicker: true,
      timePickerIncrement: 30,
      locale: {
        format: 'MM/DD/YYYY hh:mm A'
      }
    })
    //Date range as a button
    $('#daterange-btn').daterangepicker(
      {
        ranges   : {
          'Today'       : [moment(), moment()],
          'Yesterday'   : [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Last 7 Days' : [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month'  : [moment().startOf('month'), moment().endOf('month')],
          'Last Month'  : [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: moment().subtract(29, 'days'),
        endDate  : moment()
      },
      function (start, end) {
        $('#reportrange span').html(start.format('D MMMM, YYYY') + ' - ' + end.format('D MMMM, YYYY'))
      }
    )

    //Timepicker
    $('#timepicker').datetimepicker({
      format: 'LT'
    })
    
    //Bootstrap Duallistbox
    $('.duallistbox').bootstrapDualListbox()

    //Colorpicker
    $('.my-colorpicker1').colorpicker()
    //color picker with addon
    $('.my-colorpicker2').colorpicker()

    $('.my-colorpicker2').on('colorpickerChange', function(event) {
      $('.my-colorpicker2 .fa-square').css('color', event.color.toString());
    });

    $("input[data-bootstrap-switch]").each(function(){
      $(this).bootstrapSwitch('state', $(this).prop('checked'));
    });

  })
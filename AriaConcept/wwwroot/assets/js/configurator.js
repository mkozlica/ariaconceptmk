$(document).ready(function () {

    userName = getUsername();
    function getUsername() {
        let userData = document.getElementById('userActions').innerText;
        userData = userData.replace(/\.|@/g, '');
        return userData;
    }
    setupBucket(userName);

    // ACCORDION

    // auto active first element
    //$('.accordion > li:eq(0) a').addClass('active').next().slideDown();

    $('.accordion a.trigger').click(function (j) {
        var dropDown = $(this).closest('li').find('.content');

        $(this).closest('.accordion').find('.content').not(dropDown).slideUp();

        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $(this).closest('.accordion').find('a.trigger.active').removeClass('active');
            $(this).addClass('active');
        }

        dropDown.stop(false, true).slideToggle();

        j.preventDefault();
    });

    //LOCATION

    var locations = [{
        'name': 'Near the left wall',
        'image': '/assets/images/loc_near_the_left.svg',
        'acronym': 'fw'
    },
    {
        'name': 'Near the right wall',
        'image': '/assets/images/loc_near_the_right.svg',
        'acronym': 'tw'
    },
    {
        'name': 'Between two walls',
        'image': '/assets/images/loc_between_two_walls.svg',
        'acronym': 'w2w'
    },
    {
        'name': 'No walls near',
        'image': '/assets/images/loc_no_walls.svg',
        'acronym': 'none'
    }
    ];

    var locationHtml = '';

    locations.forEach(function (location, index) {
        locationHtml += '<div class="single_location" data-location="' + location.name + '" data-acronym="' + location.acronym + '"><img src="' + location.image + '"> <p>' + location.name + '</p></div>';
    });

    $("#locations-list").append(locationHtml);

    $('.single_location').click(function () {
        selectedLocation = $(this).attr('data-location');
        selectedAcronym = $(this).attr('data-acronym');
        frameChanged(selectedAcronym);
        saveConfiguration(selectedAcronym);
        $("#orderForm #location").val(selectedLocation);

        $(".sum-location").html("<p>---" + selectedLocation + "</p>");
    });

    // DIMENSIONS SLIDER

    var height_min = "1400";
    var height_init = "2600";
    var height_max = "3100";

    var width_min = "350";
    var width_init = "750";
    var width_max = "4500";

    var depth_min = "350";
    var depth_init = "500";
    var depth_max = "680";

    var leg_height_min = "80";
    var leg_height_init = "80";
    var leg_height_max = "100";

    // max /min html append
    var maxwidth = "<p>min. height: " + height_min + "/ max. height: " + height_max + "</p>";
    maxwidth += "<p>min. width: " + width_min + "/ max. width: " + width_max + "</p>";
    maxwidth += "<p>min. depth: " + depth_min + "/ max. depth: " + depth_max + "</p>";
    maxwidth += "<p>min. leg height: " + leg_height_min + "/ max. leg height: " + leg_height_max + "</p>";

    $(".dimensions-min-max").append(maxwidth);

    $('#height-slider.range-slider input').attr('min', height_min);
    $('#height-slider.range-slider input').attr('max', height_max);
    $('#height-slider.range-slider input').val(height_init);
    $('#height-slider.range-slider .range-slider__value').html(height_init);

    $('#width-slider.range-slider input').attr('min', width_min);
    $('#width-slider.range-slider input').attr('max', width_max);
    $('#width-slider.range-slider input').val(width_init);
    $('#width-slider.range-slider .range-slider__value').html(width_init);

    $('#depth-slider.range-slider input').attr('min', depth_min);
    $('#depth-slider.range-slider input').attr('max', depth_max);
    $('#depth-slider.range-slider input').val(depth_init);
    $('#depth-slider.range-slider .range-slider__value').html(depth_init);

    $('#leg-height-slider.range-slider input').attr('min', leg_height_min);
    $('#leg-height-slider.range-slider input').attr('max', leg_height_max);
    $('#leg-height-slider.range-slider input').val(leg_height_init);
    $('#leg-height-slider.range-slider .range-slider__value').html(leg_height_init);

    var rangeSlider = function () {
        var slider = $('.range-slider'),
            range = $('.range-slider__range'),
            value = $('.range-slider__value');

        slider.each(function () {

            value.each(function () {
                var value = $(this).prev().attr('value');
                $(this).html(value);
            });

        });
    };

    rangeSlider();

    $('.range-slider').on('change', function () {
        value = $(this).children('.range-slider__range').val();
        $(this).children('.range-slider__value').html(value);
        dimensions = $(this).children('.range-slider__range').attr('data-dimensions');
        $(".sum-" + dimensions).html("<p>---" + dimensions + " is " + value / 10 + " cm</p>");
        saveDimensions();
    });

    $('.btn-range').click(function () {
        var direction = $(this).data("dir");
        let value = $(this).siblings('.range-slider__range').val();

        if (direction == "plus") {
            value++;
        } else {
            value--;
        };
        $(this).siblings('.range-slider__range').val(value);
        $(this).siblings('.range-slider__value').text(value);
        dimensions = $(this).siblings('.range-slider__range').attr('data-dimensions');
        $(".sum-" + dimensions).html("<p>---" + dimensions + " is " + value / 10 + " cm</p>");
        saveDimensions();
    });
    
    getDimensions();
    function getDimensions() {
        $(".dimensions-res").empty();
        $(".sum-height").empty();
        $(".sum-width").empty();
        $(".sum-depth").empty();
        $(".sum-leg-height").empty();
        $('.range-slider').each(function () {

            value = $(this).children('.range-slider__range').val();
            dimensions = $(this).children('.range-slider__range').attr('data-dimensions');

            console.log(dimensions, value / 10);

            $(".dimensions-res").append("<p>" + dimensions + ": " + value + "</p>");
            $(".sum-" + dimensions).append("<p>---" + dimensions + " is " + value / 10 + " cm</p>");
            $("#orderForm #" + dimensions).val(value);

        });
    };

    // MODULES

    var modules = [{
        'name': 'Module Name 1',
        'image': '/assets/images/module_1.svg'
    },
    {
        'name': 'Module Name 2',
        'image': '/assets/images/module_2.svg'
    },
    {
        'name': 'Module Name 3',
        'image': '/assets/images/module_3.svg'
    },
    {
        'name': 'Module Name 4',
        'image': '/assets/images/module_4.svg'
    },
    {
        'name': 'Module Name 5',
        'image': '/assets/images/module_5.svg'
    },
    {
        'name': 'Module Name 6',
        'image': '/assets/images/module_6.svg'
    },
    {
        'name': 'Module Name 7',
        'image': '/assets/images/module_7.svg'
    }];

    // TODO - ovo sve obrisati jer ne mo�e se unapred postaviti lista.Ona se popunjava na osnovu izabranih dimenzija.Vidi componentEvents.js getHTMLForModule
    //var modulesHtml = "";

    //modules.forEach(function (module, index) {
    //    modulesHtml += "<div class='single-module' data-module='" + module.name + "'><img src='" + module.image + "'> <p>" + module.name + "</p></div>"
    //});

    //$("#modules-list").append(modulesHtml);

    //$('.single-module').click(insertModuleOnList);

    // COLORS
    /***************************************************
     *                                                 *
     * Boje objedinjujem u jedan niz                   *
     * Ne dozvoljavamo korisniku da luduje sa bojama   *
     * Ima maksimalno deset boja na raspolaganju       *
     * i za spolja i unutra                            *
     *                                                 *
     * ************************************************/

    var colors = [
        {
            'name': 'Color Name 1',
            'image': '/assets/images/color_01.jpg',
            'category': 'Basic'
        },
        {
            'name': 'Color Name 2',
            'image': '/assets/images/color_02.jpg',
            'category': 'Basic'
        },
        {
            'name': 'Color Name 3',
            'image': '/assets/images/color_03.jpg',
            'category': 'Basic'
        },
        {
            'name': 'Color Name 4',
            'image': '/assets/images/color_04.jpg',
            'category': 'Standard'
        },
        {
            'name': 'Color Name 5',
            'image': '/assets/images/color_05.jpg',
            'category': 'Standard'
        },
        {
            'name': 'Color Name 6',
            'image': '/assets/images/color_06.jpg',
            'category': 'Standard'
        },
        {
            'name': 'Color Name 7',
            'image': '/assets/images/color_07.jpg',
            'category': 'Standard'
        },
        {
            'name': 'Color Name 8',
            'image': '/assets/images/color_08.jpg',
            'category': 'Premium'
        },
        {
            'name': 'Color Name 9',
            'image': '/assets/images/color_09.jpg',
            'category': 'Premium'
        }];

    //var colors_inside = [
    //    {
    //    'name': 'Color Name 1',
    //    'image': '/assets/images/color_1.jpeg',
    //    'category': 'Basic'
    //},
    //{
    //    'name': 'Color Name 2',
    //    'image': '/assets/images/color_2.jpeg',
    //    'category': 'Basic'
    //},
    //{
    //    'name': 'Color Name 3',
    //    'image': '/assets/images/color_3.jpeg',
    //    'category': 'Basic'
    //},
    //{
    //    'name': 'Color Name 4',
    //    'image': '/assets/images/color_4.jpeg',
    //    'category': 'Standard'
    //},
    //{
    //    'name': 'Color Name 5',
    //    'image': '/assets/images/color_5.jpeg',
    //    'category': 'Standard'
    //},
    //{
    //    'name': 'Color Name 6',
    //    'image': '/assets/images/color_6.jpeg',
    //    'category': 'Standard'
    //},
    //{
    //    'name': 'Color Name 7',
    //    'image': '/assets/images/color_7.jpeg',
    //    'category': 'Standard'
    //},
    //{
    //    'name': 'Color Name 8',
    //    'image': '/assets/images/color_8.jpeg',
    //    'category': 'Premium'
    //},
    //{
    //    'name': 'Color Name 9',
    //    'image': '/assets/images/color_9.jpeg',
    //    'category': 'Premium'
    //},
    //{
    //    'name': 'Color Name 10',
    //    'image': '/assets/images/color_10.jpeg',
    //    'category': 'Premium'
    //}];

    //var colors_outside = [
    //    {
    //    'name': 'Color Name 1',
    //    'image': '/assets/images/color_1.jpeg',
    //    'category': 'Basic'
    //},
    //{
    //    'name': 'Color Name 2',
    //    'image': '/assets/images/color_2.jpeg',
    //    'category': 'Basic'
    //},
    //{
    //    'name': 'Color Name 3',
    //    'image': '/assets/images/color_3.jpeg',
    //    'category': 'Basic'
    //},
    //{
    //    'name': 'Color Name 4',
    //    'image': '/assets/images/color_4.jpeg',
    //    'category': 'Standard'
    //},
    //{
    //    'name': 'Color Name 5',
    //    'image': '/assets/images/color_5.jpeg',
    //    'category': 'Standard'
    //},
    //{
    //    'name': 'Color Name 6',
    //    'image': '/assets/images/color_6.jpeg',
    //    'category': 'Standard'
    //},
    //{
    //    'name': 'Color Name 7',
    //    'image': '/assets/images/color_7.jpeg',
    //    'category': 'Premium'
    //},
    //{
    //    'name': 'Color Name 8',
    //    'image': '/assets/images/color_8.jpeg',
    //    'category': 'Premium'
    //},
    //{
    //    'name': 'Color Name 9',
    //    'image': '/assets/images/color_9.jpeg',
    //    'category': 'Premium'
    //},
    //{
    //    'name': 'Color Name 10',
    //    'image': '/assets/images/color_10.jpeg',
    //    'category': 'Premium'
    //}];

    var colors_insideHtml = "";
    var colors_outsideHtml = "";

    /****************************************************
     *                                                  *
     * Na jednom mestu poponjavamo listu boja           *
     *                                                  *
     * **************************************************/
    colors.forEach(function (color, index) {
        colors_insideHtml += "<div class='single-color-inside' data-color='" + color.name + "'><img src='" + color.image + "'> <p>" + color.name + "</p></div>"
        colors_outsideHtml += "<div class='single-color-outside' data-color='" + color.name + "'><img src='" + color.image + "'> <p>" + color.name + "</p></div>"
    });

    //inside
    //colors_inside.forEach(function (color, index) {
    //    colors_insideHtml += "<div class='single-color-inside' data-color='" + color.name + "'><img src='" + color.image + "'> <p>" + color.name + "</p></div>"
    //});

    $("#colors-inside-list").append(colors_insideHtml);
    $('.single-color-inside').click(function () {
        insideColor = $(this).attr('data-color');
        $("#orderForm #colorInside").val(insideColor);
        $(".sum-color-inside").html("<p>--- Inside Color: " + insideColor + "</p>");
        colorsCheck ();
    });

    //outside
    //colors_outside.forEach(function (color, index) {
    //    colors_outsideHtml += "<div class='single-color-outside' data-color='" + color.name + "'><img src='" + color.image + "'> <p>" + color.name + "</p></div>"
    //});

    $("#colors-outside-list").append(colors_outsideHtml);
    $('.single-color-outside').click(function () {
        outsideColor = $(this).attr('data-color');       
        $("#orderForm #colorOutside").val(outsideColor);
        $(".sum-color-outside").html("<p>-- Outside Color: " + outsideColor + "</p>");
        colorsCheck ();  
    });

    function colorsCheck () {
        if ((($('.aria-door[name=doors]:checked').val() == 'Without door' ) && (insideColor == null)) || ((insideColor != null) && (outsideColor != null))) {
            $('#applyColor').removeClass('unactive');
            $('#applyColor').prop('disabled', false);
        } else {
            $('#applyColor').addClass('unactive');
            $('#applyColor').prop('disabled', true);
        }

    }

    //doors
    $(".aria-door").change(function () {
        if ($(this).is(":checked")) {
            $("#orderForm #" + $(this).attr('name')).val($(this).val());
            $(".sum-" + $(this).attr('name')).html("<p>--- " + $(this).val() + "</p>");
            if ($('.aria-door[name=doors]').is(':checked') && $('.aria-door[name=handle]').is(':checked') && $('.aria-door[name=bottom]').is(':checked') && $('.aria-door[name=LED]').is(':checked') && myWardrobe.length > 0){
                $('#createPreview').removeClass('unactive');
                $('#createPreview').prop('disabled', false);
            } else {
                $('#createPreview').addClass('unactive');
                $('#createPreview').prop('disabled', true);
            }

            // colours list checker
            if ($('.aria-door[name=doors]:checked').val() == 'Without door' ) {
                $("#colors-inside-list").css('display', 'none');
                $(".inside-title").css('display', 'none');
                //$(".doors-list > .aria-checkbox").css('display', 'none');
            } else {
                $("#colors-inside-list").css('display', 'inline-block');
                $(".inside-title").css('display', 'inline-block');
                //$(".doors-list > .aria-checkbox").css('display', 'inline-block');
            }

            colorsCheck (); 
        }
        saveCommonData();
    });

    //PREVIEW

    $('#createPreview').click(function () {
        // submit data to Forge
        //createAppBundleActivity();
        collectAndSend();
    });

    //APPLY COLOR

    $('#applyColor').click(function () {
        // submit data to Forge
        console.log('apply color event');
        applyColor();
    });

    //SUBMIT

    $("#orderForm").submit(function (e) {
        e.preventDefault();
        var data = $(this).serialize();

        //alert(data);

        // $.ajax({
        //     url: 'some-url',
        //     type: 'post',
        //     dataType: 'json',
        //     data: $('form#myForm').serialize(),
        //     success: function(data) {

        //              }
        // });

        
    });

    $("#submitOrder").click(function () {
        createFinalDocumentation();
    });

    // reset

    $("#orderForm .reset").click(function () {
        console.log('rest');
        $(this).closest('form').find("input.order-field").val("");
        $('.aria-checkbox').val('');
        $('.summary').empty();
    });

    $('#applyColor').prop('disabled', true);
    $('#createPreview').prop('disabled', true);
});


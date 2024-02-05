
const width  = 740;
const height = 700;
var margin = {top:60, right:80, bottom: 40, left:120}
const gap = 100

// 100 scale
full_scale = width - margin.left - margin.right

//gender: female 0, male 1
domain = {pts:[0,100], gender:[0,1], brain_dmean:[5,50],
          baseline:[7.0,0.0], tot_pts:[0, 220], slp:[0.01, 0.6]}

points = {pts:[0,100], gender:[0,36], brain_dmean:[0,100],
          baseline:[88,0], tot_pts:[0,220], slp:[47,207]}

scales = { pts : 1.0,
           gender: points.gender[1]/points.pts[1],
           brain_dmean: (points.brain_dmean[1]-points.brain_dmean[0])/ points.pts[1],
           baseline: points.baseline[0]/points.pts[1],
           tot_pts:1.0,
           slp: (points.slp[1]-points.slp[0])/points.tot_pts[1]
         }

starts = {pts: margin.left,
          gender: margin.left,
          brain_dmean: margin.left,
          baseline: margin.left,
          tot_pts: margin.left,
          slp: margin.left + points.slp[0]/points.tot_pts[1]*full_scale} 


// Create the SVG container.
const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])

const pts = d3.scaleLinear()
      .domain(domain.pts)
      .range([margin.left, margin.left + full_scale ]);

// Gender Male/Female
const gender = d3.scaleLinear()
      .domain(domain.gender)
      .range([starts.gender, starts.gender + full_scale * scales.gender]);


// Brain Mean dose
const brain_dmean = d3.scaleLinear()
      .domain(domain.brain_dmean)
      .range([starts.brain_dmean, starts.brain_dmean + full_scale * scales.brain_dmean]);


// Baseline (Pre-CCRT ALC x10)
const baseline = d3.scaleLinear()
      .domain(domain.baseline)
      .range([starts.baseline, starts.baseline + full_scale * scales.baseline]);

const tot_pts = d3.scaleLinear()
      .domain(domain.tot_pts)
      .range([starts.tot_pts, starts.tot_pts + full_scale]);

const slp = d3.scaleLinear()
      .domain(domain.slp)
      .range([starts.slp, starts.slp + full_scale * scales.slp]);


// Add the x-axis.
svg.append("g")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisBottom(pts))
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(0)")
    .attr("x", margin.left-20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Points");


svg.append("g")
    .attr("transform", `translate(0,${margin.top+gap})`)
    .call(d3.axisBottom(gender).tickValues([0,1]))
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(0)")
    .attr("x", margin.left-20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Gender");

svg.append("g")
    .attr("transform", `translate(0,${margin.top+2.0*gap})`)
    .call(d3.axisBottom(brain_dmean))
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(0)")
    .attr("x", margin.left-20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Brain Dmean (Gy)");

svg.append("g")
    .attr("transform", `translate(0,${margin.top+3*gap})`)
    .call(d3.axisBottom(baseline))
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(0)")
    .attr("x", margin.left-20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Baseline ALC (x1000)");

svg.append("g")
    .attr("transform", `translate(0,${margin.top+4*gap})`)
    .call(d3.axisBottom(tot_pts))
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(0)")
    .attr("x", margin.left-20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Total Points");

svg.append("g")
    .attr("transform", `translate(0,${margin.top+5*gap})`)
    .call(d3.axisBottom(slp))
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(0)")
    .attr("x", margin.left-20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Probability of SLP");




function gender_points(ig){
//    1  0.00000 (male)
//    2 36.00951 (female)
    if (ig){
        return 36.00951
    }else{
        return 0.0
    }
}

function dose_points(ig){
    //[1] "points = 2.22222222 * Brain_Dmean (gy) + -11.11111111"
    return 2.22222222 * ig + -11.11111111
}

function baseline_points(ig){
    //**Baseline ALC 기준은 x10^3/uL 기준.
    //[1] "points = 0 * Baseline_ALC ^3 + 0 * Baseline_ALC ^2 + -12.51118092 * Baseline_ALC + 87.57826641"
    return -12.51118092 * ig + 87.57826641
}

function total_points(is_female, dose, alc){
    return gender_points(is_female) + dose_points(dose) + baseline_points(alc)
}

function probability(points){
    //[[5]] SLP 발생 확률 --> 추후에 x 100 (%) 으로 환산해야함.
    //[1] "Probability of SLP = 9e-08 * points ^3 + -5.93e-06 * points ^2 + 4.978e-05 * points + 0.01104449"
    return  9e-08 * (points**3) + -5.93e-06 * (points**2) + 4.978e-05 * points + 0.01104449
}


// -----------------------------------------//
// Initialize variables
// -----------------------------------------//
// input
var input_gender   = true //female:true, male:false
var input_dose     = 45.0 
var input_baseline = 5.0 


function draw_nomogram(){
    
    // output
    var output_gender   = gender_points(input_gender)
    var pts_gender      = pts(output_gender)
    var output_dose     = dose_points(input_dose)
    var pts_dose        = pts(output_dose)
    var output_baseline = baseline_points(input_baseline)
    var pts_baseline    = pts(output_baseline)
    
    svg.append("circle")
        .attr("class", "gender_select")
        .attr("cx", gender(input_gender))
        .attr("cy", margin.top+1*gap)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "red")
        .attr("r", 5)

    svg.append("circle")
        .attr("class", "gender_point")
        .attr("cx", pts_gender)
        .attr("cy", margin.top+0*gap)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "red")
        .attr("r", 5)

    svg.append("circle")
        .attr("class", "dose_input")
        .attr("cx", brain_dmean(input_dose))
        .attr("cy", margin.top+2*gap)
        .attr("stroke", "green")
        .attr("r", 5)

    svg.append("circle")
        .attr("class", "dose_point")
        .attr("cx", pts_dose)
        .attr("stroke", "green")
        .attr("cy", margin.top+0*gap)
        .attr("r", 5)

    svg.append("circle")
        .attr("class", "baseline_input")
        .attr("stroke", "blue")
        .attr("cx", baseline(input_baseline))
        .attr("cy", margin.top+3*gap)
        .attr("r", 5)

    svg.append("circle")
        .attr("class", "baseline_point")
        .attr("stroke", "blue")
        .attr("cx", pts(baseline_points(input_baseline)))
        .attr("cy", margin.top+0*gap)
        .attr("r", 5)

    // -----------------------------------------//
    // Total points
    // -----------------------------------------//
    var input_total    = total_points(input_gender, input_dose, input_baseline)
    var input_slp      = probability(input_total)
    svg.append("circle")
        .attr("class", "total_input")
        .attr("cx", tot_pts(input_total))
        .attr("cy", margin.top+4*gap)
        .attr("r", 5)

    // -----------------------------------------//
    // Probability of SLP
    // -----------------------------------------//
    svg.append("circle")
        .attr("class", "total_slp")
        .attr("cx", slp(input_slp))
        .attr("cy", margin.top+5*gap)
        .attr("r", 5)
    
    d3.select("#slp_value").text((100.0*input_slp).toPrecision(2))
}

function update_nomogram(){

    var output_gender   = gender_points(input_gender)
    var output_dose     = dose_points(input_dose)
    var output_baseline = baseline_points(input_baseline)

    var pts_gender      = pts(output_gender)
    var pts_dose        = pts(output_dose)
    var pts_baseline    = pts(output_baseline)
    
    svg.select("circle.gender_select")
        .attr("cx", gender(input_gender))

    svg.select("circle.gender_point")
        .attr("cx", pts_gender)

    svg.select("circle.dose_input")
        .attr("cx", brain_dmean(input_dose))
    
    svg.select("circle.dose_point")
        .attr("cx", pts_dose)

    svg.select("circle.baseline_input")
        .attr("cx", baseline(input_baseline))
    
    svg.select("circle.baseline_point")
        .attr("cx", pts_baseline)

    var input_total    = total_points(input_gender, input_dose, input_baseline)
    var input_slp      = probability(input_total)
    svg.select("circle.total_input")
        .attr("cx", tot_pts(input_total))


    // -----------------------------------------//
    // Probability of SLP
    // -----------------------------------------//
    svg.select("circle.total_slp")
        .attr("cx", slp(input_slp))

    d3.select("#slp_value").text((100.0*input_slp).toPrecision(2))
}

function draw_slp(){
    svg.append("line")
        .style("stroke", "red")
        .attr("x1" , pts_gender)
        .attr("y1" , margin.top+0.0*gap )
        .attr("x2" , pts_gender)
        .attr("y2" , margin.top+1*gap)
    
    svg.append("line")
        .style("stroke", "green")
        .attr("x1" , pts_dose)
        .attr("y1" , margin.top+0.0*gap )
        .attr("x2" , pts_dose)
        .attr("y2" , margin.top+2*gap)

    svg.append("line")
        .style("stroke", "blue")
        .attr("x1" , pts_baseline)
        .attr("y1" , margin.top+0.0*gap )
        .attr("x2" , pts_baseline)
        .attr("y2" , margin.top+3*gap)

    // three lines to total point
    svg.append("line")
        .style("stroke", "red")
        .attr("x1" , pts_gender)
        .attr("y1" , margin.top+1*gap)
        .attr("x2" , tot_pts(input_total))
        .attr("y2" , margin.top+4*gap )

    svg.append("line")
        .style("stroke", "green")
        .attr("x1" , pts_dose)
        .attr("y1" , margin.top+2*gap)
        .attr("x2" , tot_pts(input_total))
        .attr("y2" , margin.top+4*gap )

    svg.append("line")
        .style("stroke", "blue")
        .attr("x1" , pts_baseline)
        .attr("y1" , margin.top+3*gap)
        .attr("x2" , tot_pts(input_total))
        .attr("y2" , margin.top+4*gap )

    svg.append("line")
        .style("stroke", "black")
        .attr("x1" , tot_pts(input_total))
        .attr("y1" , margin.top+4*gap )
        .attr("x2" , slp(input_slp))
        .attr("y2" , margin.top+5*gap)
        .attr("marker-end", "url(#triangle)");
}


draw_nomogram()

d3.select("#male").on("change", function(){
    input_gender = false 
    update_nomogram();
});
d3.select("#female").on("change", function(){
    input_gender = true 
    update_nomogram();
});
d3.select("#brain_dose").on("input", function(){
    input_dose     =  this.value
    update_nomogram();
});
d3.select("#baseline").on("input", function(){
    input_baseline = this.value
    update_nomogram();
});


// Return the SVG element.
plot_div.append(svg.node());

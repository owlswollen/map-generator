/**
 * GMap-JSlicer v0.1
 * Author: Matt Urtnowski
 * GitHub: https://github.com/Murtnowski/GMap-JSlicer
 *
 * Not Production Ready
 * For use as code sample only
 **/
var cities = [];
var numberOfPoints = 1000;
// The variable for the roads
var line = new google.maps.Polyline({
  map: null
});

var distance_unit;

// Add Custom Controls
function littleButton(controlDiv, title, eventListener) {
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = title;
  controlDiv.appendChild(controlUI);
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '';
  controlUI.appendChild(controlText);
  controlUI.addEventListener('click', eventListener);
}

// The function that draws the road when an item in the dropbox is selected
var onChangeHandler = function() {
  line.setMap(null);
  var x1 = cities[document.getElementById('start').value].cx.baseVal.value,
    x2 = cities[document.getElementById('end').value].cx.baseVal.value,
    y1 = cities[document.getElementById('start').value].cy.baseVal.value,
    y2 = cities[document.getElementById('end').value].cy.baseVal.value;
  var points = [];
  var distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  document.getElementById('distance_a_b').children[0].children[0].innerHTML = String(Math.round(distance * 1000) / 100) + ' ' + distance_unit;
  if (x1 === x2 && y1 === y2) {
    return;
  }
  var slope = (y2 - y1) / (x2 - x1);
  var x_diff = Math.abs(x2 - x1);
  var x_piece = x_diff / numberOfPoints;
  for (var i = 0; i < numberOfPoints + 1; i++) {
    var x, y;
    if (i == 0) {
      points.push(inverseProject(normalizeTo256(x1, y1)));
    } else if (i == numberOfPoints) {
      points.push(inverseProject(normalizeTo256(x2, y2)));
    } else {
      if (x1 < x2) {
        y = slope * ((x1 + i * x_piece) - x1) + y1;
        points.push(inverseProject(normalizeTo256(x1 + i * x_piece, y)));
      } else {
        y = slope * ((x1 - i * x_piece) - x1) + y1;
        points.push(inverseProject(normalizeTo256(x1 - i * x_piece, y)));
      }
    }
  }

// line = new google.maps.Polyline({
//   path: points,
//   strokeColor: "#6767d1",
//   strokeOpacity: .9,
//   strokeWeight: 7,
//   map: fantasyMap
// });
autoRefresh(fantasyMap, points);
};

// https://github.com/duncancumming/maps/blob/master/animatedPaths/1.html
function moveMarker(map, marker, latlng) {
  marker.setPosition(latlng);
}
var route, marker;

function autoRefresh(map, points) {
  var i;
  if (route !== null && typeof route !== "undefined")
    route.setMap(null);
  if (marker !== null && typeof marker !== "undefined")
    marker.setMap(null);

  route = new google.maps.Polyline({
    path: [],
    // geodesic: true,
    strokeColor: "#6767d1",
    strokeOpacity: .9,
    strokeWeight: 7,
    editable: false,
    map: map
  });

  marker = new google.maps.Marker({
    map: map,
    icon: './witchMarkerSmall.png'
  });
  for (i = 0; i < points.length; i++) {
    setTimeout(function(coords, i) {
      var latlng = new google.maps.LatLng(coords.lat(), coords.lng());
      route.getPath().push(latlng);
      moveMarker(map, marker, latlng);
      if (i == numberOfPoints)
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }, 5 * i, points[i], i);
  }
}

function JSlicer(target, src) {
  this.img;
  this.target = target;
  this.src = src;
  this.centreLat = 0.0;
  this.centreLon = 0.0;
  this.initialZoom = 2;
  this.imageWraps = true;
  this.map;
  this.gmicMapType;
}

function GMICMapType(img) {
  this.sourceImg = img;
  this.Cache = Array();
  this.opacity = 1.0;
}

(function() {
  JSlicer.prototype.init = function init() {
    var that = this;

    var downloadAsset = function(src, callback) {
      if (!this.img) {
        var img = document.createElement('img');

        img.onerror = function() {
          console.log(src + ' failed to load');
          if (callback) {
            callback(false);
          }
        };

        img.onload = function() {
          var canvas = document.createElement('canvas');
          var dimension = Math.max(img.width, img.height);
          canvas.width = dimension;
          canvas.height = dimension;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, (dimension - img.width) / 2, (dimension - img.height) / 2);

          img.onload = function() {
            img.removeEventListener('onload', arguments.callee, false);
            that.img = img;
            if (callback) {
              callback(img);
            }
          };

          img.src = canvas.toDataURL();
        };

        img.src = src;
      } else {
        if (callback) {
          callback(this.img);
        }
      }
    };

    var load = function() {
      var latlng = new google.maps.LatLng(that.centreLat, that.centreLon);
      var myOptions = {
        backgroundColor: "#3f3f41",
        zoom: that.initialZoom,
        minZoom: 0,
        maxZoom: 7,
        center: latlng,
        panControl: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: true,
        mapTypeControlOptions: {
          mapTypeIds: ["Fantasy"],
          position: google.maps.ControlPosition.TOP_RIGHT,
          style: google.maps.MapTypeControlStyle.DEFAULT
        },
        mapTypeId: "Fantasy"
      }

      fantasyMap = new google.maps.Map(that.target, myOptions);
      gmicMapType = new GMICMapType(that.img);
      fantasyMap.mapTypes.set("Fantasy", gmicMapType);

      if (!that.imageWraps) {
        that.setBounds();
      }

      distance_unit = makeName(lang, 'distance');

      var distanceWindowDiv = document.createElement('div');
      distanceWindowDiv.setAttribute("id", "distance_a_b");
      littleButton(distanceWindowDiv, 'Distance of the way', null);
      distanceWindowDiv.index = 1;
      fantasyMap.controls[google.maps.ControlPosition.TOP_LEFT].push(distanceWindowDiv);
      distanceWindowDiv.children[0].children[0].innerHTML = '0 ' + distance_unit;

      // All the cities, names, coordinates, stories, and matchings
      var inputs = document.getElementsByClassName("city");
      var cityNames = [];
      var cityLatLng = [];
      var myMarkers = [];
      var stories = [];
      stories[1] = "Atletizmin başkenti olan " + 'placeholder' + ", her yıl geleneksel olarak düzenlenen Mernatoir Olimpiyatları'na ev sahipliği yapmaktadır. Bunun yanı sıra evrenin en iyi at yetiştiricilerine sahiptirler, bu durum insanlarının üstün binicilik yeteneğine sahip olmalarını sağlamıştır.";
      stories[2] = "Yıllardan beri bu ülkenin yemek kültürü hakkında araştırmalar yapılmıştır ancak hala bu kadar lezzetli yemeklerin nasıl yapıldığı hakkında en ufak bir ipucuna rastlanmamıştır. Topraklarından mıdır, insanlarının elinin lezzeti midir ya da yemekler bir çeşit büyü ile mi yapılıyor bilinmez ama bir yiyenin, bir daha yemek için can attığı bir gerçektir. Yemek turizmi lafının çıkış noktası bu ülke topraklarıdır.";
      stories[3] = "Sessiz ve sakin bir devlet olan " + 'placeholder' + ", kimya alanında diğer devletlerin gıptayla baktığı bir gelişmişliğe sahiptir. Özellikle sağlık alanında, ürettikleri çeşitli ilaç ve iksirler ile büyük ün yapmışlardır. Diğer devletlere sattıkları bu ürünlerle ekonomik anlamda çok rahat bir duruma gelmişlerdir.";
      stories[4] = "Mernatoir evreninin en kaliteli şaraplarının üretildiği yer, " + 'placeholder' + " şehridir. Sahip oldukları hektarlarca üzüm bağı ile şarap üretip, geçimlerini bununla sağlarlar.";
      stories[5] = 'placeholder' + " devleti yenilgiyle ayrıldığı savaşlardan sonra oldukça zayıflayarak yıkılma noktasına gelmiştir. Karanlık bir atmosfere sahip şehirde kara büyücüler ve ünlü hırsızlar cirit atmaktadır. Şehirde yıllar önce kullanılmakta olan ve büyülü olduğu söylenen bir zindan bulunmaktadır.";
      stories[6] = "Doğa ile iç içe olan bu devlet, botanik alanında evrenin 1 numarası konumundadır. Birçok endemik bitki türlerinin bulunduğu bu topraklar, bitki örtüsü bakımından çok değerlidir.";
      stories[7] = "Göçebe bir toplum olan Urimariler'in son olarak ziyaret ettikleri yer olan şehirdir. Eşkiyalıklarıyla bilinen bu ırk, yağma ve hırsızlıkla hayatta kalmaya çalışır. Kendilerine son dönemde bir bayrak seçerek diğer devletler tarafından bir devlet olarak kabul edilmiştir ve dolayısıyla " + 'placeholder' + " şehri de onların şehri olarak kabul edilir.";
      stories[8] = "Müzik denince akla ilk gelen devlettir. Rahatlarına oldukça düşkün bir halka sahip olan bu devlet, 1603 yıllık tarihinde hiçbir savaşa katılmamıştır. Diğer devletler bu şehrin müzisyenlerini ve dansçılarını kendi eğlence organizasyonları için para karşılığı kiralarlar.";
      stories[9] = "Şakasız anlamda bir gönül zenginliğine sahip olan bu ülkede insanlar çok mutludur, kimse kismeyi kırmaz ve hiçbir kötülük yapılmaz. Kötülük yapan kişi kanunen tüm halka sarılmak zorundadır, ancak öyle affedilir.";
      stories[10] = 'placeholder' + ", büyücülük konusunda rakipsiz olan bir şehir devletidir. Evrenin en yetenekli büyücüsü olan Gnomeferatu burada yaşamaktadır. Kendisi bir kara büyücü olmasına rağmen ülkesi için çeşitli 'iyi' sonuçlar doğuran büyüler de yapmaktadır. Yıllar boyu amaçları uğruna devletler arasında birçok savaşa neden olmuştur ve hâlihazırda " + 'placeholder' + " şehri, birçok şehir ile bu sebepten savaş halindedir.";
      stories[11] = "Sık bir ormanın içinde bulunması nedeniyle ormancılık ile geçimini sağlayan bu şehir, ahşap malzeme yapımında iyi bir seviyededir. Ayrıca her yıl düzenledikleri Düdük Festivali'yle, her ülkeden binlerce ziyaretçiye ev sahipliği yapmaktadır. Bu festivalde çeşit çeşit sesler çıkaran düdükler çalınır ve bir hafta boyunca müzikler eşliğinde eğlenilir.";
      stories[12] = "Mernatoir evreninin eğitim alanında ün yapmış şehirlerinden birisidir. Matematik, fizik ve felsefe dallarında ünlü bilimcilere sahiptir. Bu, onları evrende saygın devletler arasına sokmuştur. Mernatoir Milletler Zirvesi'nde en çok üyesi bulunan " + 'placeholder' + " devleti, diğer devletler arasında sözü geçen bir devlet konumundadır.";
      stories[13] = "Harika bir bölgede bulunduğu için bu şehir, manzarası ile ün yapmıştır. Aynı zamanda mimari bakımından gelişmiş bir durumda olduğu için, şehir güzel bir görünüme sahiptir ve dış şehirlerden sürekli ziyaretçi çekmektedir. Ayrıca yalnızca bu şehirde yapılan ve tarifi paylaşılmayan ünlü " + 'placeholder' + " kurabiyeleri de diğer ülkeler tarafından oldukça yoğun bir ilgi görmektedir.";
      stories[14] = "Diktatörlükle yönetilen bu devlet, birçok devlet ile savaş halindedir. Halkı sefalet içinde yaşamaktadır ve ülkede sürekli bir isyan söz konusudur. Güvenlik konusunda zayıf bulunduğu için ülkeye giriş çıkışlar yasaklanmıştır. Ayrıca dikta rejimin son 10 yılda çıkan isyanlara sert müdahale etmesi nedeniyle nüfusun %20'si kaybedilmiştir.";
      stories[15] = "Dini açıdan büyük bir öneme sahiptir. Mernatoir evreninin ortak paydada buluştuğu tek konu olan din nedeniyle bu şehir her yıl birçok kez dini etkinliklere ev sahipliği yapmaktadır. Evrende, halkın kendi iradesiyle seçtiği dini lider Prophet Melen, bu şehirde yaşamını sürdürmektedir.";
      stories[16] = "Güzellik merkezi olarak akıllarda kalan bu şehir, kadınlarının ve erkeklerinin güzelliğiyle dillerdedir. Diğer ülkelerden insanlar onları görebilmek ve evlenebilmek bu şehri akın akın ziyarete gelirler. Ancak ülke liderleri ırklarının bu güzelliğinin bozulmasını istemedikleri için çıkardıkları yasa ile vatandaşlarının diğer ülke vatandaşlarıyla evlenmesini yasaklamıştır. Hatta bu kurala uymamanın cezası ölüm olarak belirlenmiştir.";
      stories[17] = "Toprağının kalitesi nedeniyle tarım faaliyetlerinin zirve yaptığı bir şehirdir. Geçimini tarım ve hayvancılıkla sağlayarak ekonomik anlamda rahat bir seviyeye gelmiştir. Ayrıca Mernatoir evreninde mısır üretiminin tamamı burada yapılır.";
      stories[18] = "Küçük bir köy görünümüyle kendilerini kamufle eden bu şehir, aslında bir çok teknolojik ve bilimsel araştırmaya ev sahipliği yapan bir ilim yuvasıdır. Stratejik hareket ederek çeşitli ajanlar yetiştirip, bunları diğer ülkelerin üretimlerini, araştırmalarını, icatlarını, planlarını öğrenmek üzere görevlendirerek, Mernatoir evrenini, arka planda kalarak yöneten bir devlet konumundadır. Bu onları diplomasi konusunda da başarılı bir devlet haline getirmiştir.";
      stories[19] = "Mernatoir evreninde bulunan altın rezervinin %75'ine sahip olan " + 'placeholder' + " şehri, birçok devlet tarafından hedef alınmıştır. Her yıl en az 2 saldırıya uğramaktadır fakat şimdiye kadar hiçbir savaşta mağlubiyet yüzü görmemiştir.";
      stories[20] = "Yeryüzünde demir rezervinin büyük bir çoğunluğuna sınırlarında bulundurduğu için demircilikte çok iyidirler. Diğer ülkelere ham madde ve zırh, silah gibi ürünler satarak ekonomilerini iyi seviyede tutmaktadırlar. Savunma konusunda da fazla iyilerdir. Tarihlerinde birçok saldırıya uğrayıp sınırlarına düşman güçlerini sokmamışlardır. Bazı dost ülkelere sur ve zırh yaparak onlarla ittifaklarını güçlendirmişlerdir.";
      stories[21] = "Dericilik konusunda belki de tartışmasız en şanslı ülkedir. Nedeni ise domuz, geyik, yılan gibi hayvan türlerinin bölgenin iklimi uygun olduğu için bu bölgede yaşıyor olmasıdır. Birçok ülkeye deri ihraç ederek geçimlerini sürdürmektedirler. Mernatoir evreninde yalnızca dericilik denince akla gelirler, onun haricinde fazlasıyla pasif bir ülkedir.";
      stories[22] = "Karlı bir coğrafyada bulunan " + 'placeholder' + " şehrinde, soğuk iklim şartlarına oldukça alışık bir ırk yaşamaktadır. Öyle ki özel bir fizyolojiye sahip oldukları düşünülen bu ırk, -70 derecelere kadar düşebilen sıcaklık değerlerinde rahatlıkla yaşayabilmektedir. Onun haricinde " + 'placeholder' + " evrenin en barışçıl şehirlerinden biridir.";
      stories[23] = "Birçok yetenekli büyücüye ev sahipliğe yapmaktadır ve bu büyücülerin ortak bir özelliği vardır, o da çok iyi enchanter olmalıdır. Her ne olursa olsun(silah, zırh, eşya, takı, giysi vs.), her türlü araç gereci enchantlayarak ekstra özellik eklerler ve bu durum bu ülkeyi diğer ülkelerden farklı kılar. Birçok ülkeden büyücü enchanting öğrenmek için bu ülkeyi ziyaret eder ve bilgi almak ister ancak büyücülerin bu konuda hakkında bilgi vermesi yasa dışıdır.";
      stories[24] = "Halkının ölümsüz olduğu bir şehir duydunuz mu? Evet işte o şehir " + 'placeholder' + " şehridir. Sağlık ve büyü konusundaki yeteneklerini birleştirerek ölümsüzlüğü bulan bu halk, Mernatoir evreninin en güçlü şehri konumundadır. Tarihinde yalnızca bir savaş bulunmaktadır. O savaşta esir aldıkları ünlü bir büyücü onlara bir iksir tarifi vererek özgürlüğüne kavuşmuştur. Bu tarif hali hazırda sağlık alanında iyi olan " + 'placeholder' + " şehri için ölümsüzlük kapısını aralamıştır.";
      stories[25] = "Sulak bir arazide bulunan bu ülkede yer yer bataklıklar da bulunmaktadır. Hatta bu bataklıklarda çeşitli yaratıkların olduğu bilinir. Her yıl yüzlerce insan bu bataklıklarda kaybolur ve bir daha haber alınamaz. Ülkede her yıl iki defa sinek istilasına uğrar ve hastalıktan kırılarak nüfusunun bir kısmını kaybeder. Ayrıca birkaç devletin sömürgesi konumundadırlar.";
      stories[26] = "Yeryüzünde nemin en fazla olduğu yer olarak bilinen bu şehirde her yıl dehidrasyondan birçok insan hayatını kaybeder ve buna bir çare bulunamamıştır. Fakir bir ülke olmalarından dolayı yalnızca hayatta kalacak kadar gıda ve su bulabilen bu halkın yakın zamanda sonunun geleceği tahmin edilmektedir.";
      stories[27] = "Evren üzerinde gelişmelerden hiçbir haberi olmayan bu ülke, cehaletin merkezi konumundadır. Sadece hayatta kalma becerilerine sahiptirler, başka hiçbir yetenekleri yoktur.";
      stories[28] = "Müzikle yaşayıp müzikle ölen bir devlet... " + 'placeholder' + " şehrinden bahsediyoruz. Sık sık konserler düzenlenen bu ülkede, hemen hemen herkes en az bir müzik aleti çalabilmektedir. Hatta okuma ve yazmadan önce müzik aleti çalmayı öğrenmek zorundadırlar ve bu bir yasadır. Barışçıl bir ortamda her anın müzikle geçtiği bu ülke, diğer ülkelerden sürekli göç almaktadır.";
      stories[29] = "Çeşitli içecekleriyle evrenin ağzının suyunu akıtan bir şehirden söz ediyoruz... Evet, " + 'placeholder' + " . Her damak tadına uygun içecek üretebilen yetenekli ellere sahip bu şehirde hayatın çok keyifli olduğu söyleniyor.";
      stories[30] = "Demokrasiyle yönetilen adil bir şehirdir. Halkının refah seviyesi yüksektir.";
      stories[31] = "Altın, bakır ve bor! gibi yeryüzü zenginliklerine sahip olmasına rağmen, teknolojik yeterliliğe sahip olmadığı için bu madenleri çıkaramayan bu ülke, birçok güçlü devlet tarafından sömürülmektedir.";
      stories[32] = "Kendi halinde barışçıl bir zihniyetle yaşamına devam eden " + 'placeholder' + " şehri, henüz yeni kurulmuştur ve diğer devletler tarafından henüz keşfedilmemiştir. Nüfusunun azlığı nedeniyle zaman zaman göç ederek yeni yerler keşfedip kendilerine uygun yaşam ortamı aramaktadırlar. Avcılık konusunda iyi oldukları söylenmektedir.";
      stories[33] = "Stratejik olarak oldukça önemli olan bir bölgede bulunan " + 'placeholder' + " şehri, yüksek surlarından düşman kuvvetlerini savunabilmek için yıllardan beri okçuluk eğitimğine ayrı bir önem göstererek çok yetenekli okçular yetiştirmektedir. Hatta bazı okçular zaman zaman başka ülkeler için paralı askerlik yapmaktadır";
      stories[34] = "Terkedilmiş bir şehirdir. Yıllar önce bu şehri vuran bir hastalık yüzünden halk kırılmıştır ve o günden beridir yaşam belirtisi gözlenmemiştir.";
      stories[35] = "Yakaladıkları vahşi hayvanları evcilleştirerek tarım, sanayi ya da ev hayvanı olarak kullanmayı öğrenen bu ülke, diğer ülkelere evcil hayvan tedarik etmektedir.";
      stories[36] = "Bu bölgede tehlikeli bir zindan bulunmaktadır. Söylentilere göre burada büyülü, inanılmaz güçlere sahip olan bir yüzük var ve bu yüzük dev bir ejderha tarafından korunuyor. Şu ana kdar bu zindana giren 56 kişiden haber alınamadı. Her yıl belli bir gün kendi arasından toplanan bazı savaşçıları bu zindana raid düzenler.";
      stories[37] = "Yeryüzünde bulunan 4 büyük zindandan bir diğeridir. Zindan 100 kattan oluşur ve her bir katta çok güçlü bir yaratık vardır. Bu yaratıklar geçilmeden bir sonraki kata geçilemez. Şu ana kadar yalnızca 16 kat temizlenebildi. Son 1590 yılda bu uğurda yaklaşık 3821 savaşçı vahşice katledildi.";
      stories[38] = "Bir diğer tehlikeli zindan bu bölgede bulunur. Söylentilere göre bir prenses burada hapsedilmiş ve bir büyücü onun kaçmasını ve kurtarılmasını engellemek için bütün zindanı büyü ile korumaya almış. Arındırma büyüsü bilmeyen veya yanında bunu bilen biri bir büyücü olmayanların bu zindanı temizleme şansının olmadığı söylenir.";
      stories[39] = "Yeryüzünde bulunan en ölümcül zindan bu bölgede bulunur. Şu ana kadar bu zindana girmeye cesaret eden kimse olmadı. Söylentilere göre yalnızca bir boss bulunan bu zindanda, boss görünmez ve güçleri bilinmiyor. Tek bilinen şey zindanın sonunda sonsuz mutluluk iksiri olduğudur.";
      stories[40] = "Savunma anlamında çok güçlü olan bir ülkede olan " + 'placeholder' + ", 7 ejderha tarafından korunmaktadır. Ejderhaların sayısı yıllar öncesinde 16 iken, savaşlarda savunma yaparken 9 ejderha ölmüştür. Kalan 7 ejderhanın bu ülkeyi daha ne kadar savunabileceği bilinmemektedir.";
      stories[41] = "Bir teknoloji devi olan " + 'placeholder' + "şehri, hemen hemen her gün yeni bir icat ile Mernatoir evreninde gündeme gelmektedir. Özellikle son dönemde geliştirdikleri son teknolojiye sahip insansız savaş aracı olan 'Trogg' yapabildikleriyle diğer devletleri kıskandırmaktadır. Trogg, toplayıcılık için programlanarak, çeşitli mineral ve madeni bulup kendi kendine çıkarabilmektedir. Bu özellikleri diğer devletlerin ağzını sulandırdığı için bir savaşın gündemde olduğu konuşulmaktadır.";
      stories[42] = "Pamuk üretiminde evrenin en iyisi olan " + 'placeholder' + " ,giyim sektöründe çok gelişmiştir. Birçok ülkeye pamuktan kıyafet ihraç ederek geçimini sağlar.";
      stories[43] = "Bu bölgede yaşayan Trankopuskas kabilesi tam olarak bir yamyam kabiledir. Bazı şehirlere baskınlar düzenleyerek onları katlederler. Bu şekilde bir çok köyün sonunu getirmiştir. Lütfen bu yamyamlara karşı dikkatli olun.";
      stories[44] = "Arkeoloji çalışmalarıyla sık sık gündeme gelen " + 'placeholder' + " şehri, bazı kazılarında, yaklaşık 3000 yıl önce yeryüzünde voidlord'ların hüküm sürdüğüne yönelik delillere rastlamıştır. Yaklaşık 150 yıl önce yine bir arkeoloji kazısında buldukları yüzlerce hazine sandığı ile belki de sonsuza dek yetecek ekonomik güce sahip olmuşlardır.";
      stories[45] = "Yıllar önce yaşamış ünlü modacı Neltura'nın izinden giden bu şehir, moda ve giyim sektöründe adeta evrenin göz bebeğidir. Her yıl moda günleri düzenlenir ve birçok ülkeden ünlü modacı tasarladığı kostümlerle bu moda günlerine katılır.";
      stories[46] = "Yeraltı zenginliklerinden dolayı bu ülke takı konusunda aşmış durumdadır. Zümrüt, yakut, elmastan yaptıkları çeşitli takılarla gösteriş yapmayı severler. Ekonomik anlamda rahattırlar. Sıkça hırsızların saldırısına uğrarlar. Ülkeyi ittifak oldukları ülkelerin askerleri para karşılığı korumaktadır.";
      stories[47] = "Örümceklerin istila ettiği bu şehri, insanlar yıllar önce terketmiştir. 5 metre boyuna ulaşan örümcekler adeta bu şehri ele geçirmiştir. Bazı savaşçı gruplar bu bölgenin artık bir zindan olduğunu söylerler.";
      stories[48] = "Harika bir bölgede bulunan " + 'placeholder' + ", Mernatoir evreninin turizm bakımından en güçlü şehirlerinden biridir. İklimi ve doğal güzellikleriyle herkesin beğenisini kazanmıştır.";
      stories[49] = "Goblinler diyince akla gelen tek şehir burasıdır.";
      stories[50] = "Sanat ile iç içe olan bu ülkede, sanata ve sanatçıya verilen önem o kadar yoğundur ki, insanlara sanatçı olması için devlet tarafından para verilir. Nüfusun çoğunluğu resim, müzik, tiyatro, opera veya baleden en az bir tanesiyle ilgilenmektedir.";
      stories[51] = "Barbar bir ırk olan Uruklar burada yaşar. Tüm olayları savaşmaktır. Savaşmak için yaşarlar. Fiziken çok kuvvetli olan bu ırk, genelde küçük şehirlere baskınlar düzenleyerek ganimet elde etmeye çalışırlar.";
      stories[52] = "Barışçıl bir düşünceyle kurulan ve kurulduğu günden bugüne çizgisini bozmayan " + 'placeholder' + "'de, devlet halkını düşünür ve halkın refahı için her şeyi yapmayı tercih eder, bu da mutlak mutluluğu beraberinde getirmiştir.";
      stories[53] = "Evrende cücelerin yaşadığı tek şehirdir. Mühendislik alanında çok gelişmiş bir toplumdur. Ayrıca büyü konusunda da doğuştan gelen bir yetenekleri olduğu bilinir.";
      stories[54] = "Yıllar önce bu şehirde gerçekleşen bir savaç sonunda güçlü bir büyücünün kontrol büyüsü altına giren bu şehir, o günden beri bu büyücü tarafından kontrol edilmektedir. Bu büyücünün Gnomeferatu olduğu söylenmektedir ama nerede yaşadığı hakkında kesin bir bilgi bulunmamaktadır.";
      stories[55] = "Bu bölge hastalık nedeniyle terkedilmiştir. Bazen Mencatoir'in ünlü şifacıları buraya şehri kurtarmak için gelir.";
      stories[56] = "Lanetlenmiş bir şehir olarak bilinen " + 'placeholder' + "'de, insanların başına sürekli kötü olaylar gelmektedir. Son bir yılda 5 kere savaşa katılmış ve 5'inde de mağlup olmuştur. Hastalıklar ve ekonomik zorluklar yaşanmaktadır.";
      stories[57] = "Ünlü ressam Uur Bellimi'nin doğuğ büyüdüğü şehirdir.";
      stories[58] = "Mencatoir Milletler Konseyi'nin toplanma şehridir. Evren sorunları ile ilgili tartışmak için gelen her ülkeden temsilciler burada bir araya gelir. Mencatoir'in bir nevi başkenti olarak kabul edilir.";
      stories[59] = "Bu şehrin bilinen tek özelliği, güneşin hiçbir zaman batmamasıdır. Yıllar önce burada yaşamış olan bir büyücü, sevdiği kadın güneşe benziyor diye, güneşin batmamasını sağlamıştır. O gün bugündür bu şehirde güneş batmaz.";
      stories[60] = "Yapılan yanlış büyü sonucu yerlerin mor olduğu bir şehirdir. Bu durumdan memnun olmayan halk yavaş yavaş göç etmektedir. Talihsiz olaydan sonra şehir nüfusunun %35'ini kaybetmiştir.";
      stories[61] = "Bu şehirde gerçekleşmiş olan şiddetli bir savaşta, yapılan binlerce güçlü büyü sonucu güneş kötü etkilenmiştir ve artık doğmamaya karar vermiştir.";
      stories[62] = 'placeholder' + ", Mernatoir evreninde savaşçı ruhuyla ün yapmış bir şehir devleti olarak bilinir. Tarihinde sayısız savaş olan bu " + 'placeholder' + " aynı zamanda mühendislik alanında da oldukça iyidir, zira savaşlarda kullandıkları olağanüstü mekaniklere sahip mancınık ve çeşitli ateşli silahlarıyla savaşlardaki üstün başarılarını tüm evrene kanıtlamışlardır.";

      cityNames.length = 0;
      cityNames.length = 0;
      cityLatLng.length = 0;
      cities.length = 0;
      for (var i = 0, length = inputs.length; i < length; i++) {
        if (inputs[i].tagName.indexOf('circle') >= 0) {
          cities.push(inputs[i]);
        } else {
          cityNames.push(inputs[i]);
        }
      }

      var startCity = document.getElementById('start');
      var destCity = document.getElementById('end');

      // Removes all the options for the select element in html
      // https://stackoverflow.com/a/3364546
      function removeOptions(selectbox) {
        var i;
        for (i = selectbox.options.length - 1; i >= 0; i--) {
          selectbox.remove(i);
        }
      }

      removeOptions(startCity);
      removeOptions(destCity);

      // Add the city names to the dropboxes
      for (var i = 0; i < cityNames.length; i++) {
        var cityOpt = document.createElement('option');
        cityOpt.value = i;
        cityOpt.innerHTML = cityNames[i].innerHTML;
        startCity.appendChild(cityOpt);
      }
      for (var i = 0; i < cityNames.length; i++) {
        var cityOpt = document.createElement('option');
        cityOpt.value = i;
        cityOpt.innerHTML = cityNames[i].innerHTML;
        destCity.appendChild(cityOpt);
      }

      // Add markers for each city
      for (var i = 0; i < cities.length; i++) {
        cityLatLng.push(inverseProject(normalizeTo256(cities[i].cx.baseVal.value, cities[i].cy.baseVal.value)));
      }
      var markers = new Array();
      var infoWindows = new Array();
      var cityNumbers = new Array();
      for (var j = 1; j < 63; j++) {
        cityNumbers.push(j);
      }
      shuffle(cityNumbers);
      setMarkers(fantasyMap, cityNames, cities, cityLatLng, cityNumbers, stories, markers, infoWindows);
    };

    downloadAsset(this.src, function() {
      load();
    });
  };

  JSlicer.prototype.setBounds = function setBounds() {
    var allowedBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-85.0, -180.0),
      new google.maps.LatLng(85.0, 180.0)
    );

    var lastValidCenter = fantasyMap.getCenter();

    google.maps.event.addListener(fantasyMap, 'center_changed', function() {
      if (allowedBounds.contains(fantasyMap.getCenter())) {
        lastValidCenter = fantasyMap.getCenter();
        return;
      }

      fantasyMap.panTo(lastValidCenter);
    });
  };

  JSlicer.prototype.redraw = function redraw() {
    var zoom = fantasyMap.getZoom();
    fantasyMap.setZoom(0);
    setTimeout(function() {
      fantasyMap.setZoom(zoom);
    }, 0);
  };

  GMICMapType.prototype.tileSize = new google.maps.Size(256, 256);
  GMICMapType.prototype.maxZoom = 19;
  GMICMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
    var c = Math.pow(2, zoom);
    var tilex = coord.x,
      tiley = coord.y;
    if (this.imageWraps) {
      if (tilex < 0) tilex = c + tilex % c;
      if (tilex >= c) tilex = tilex % c;
      if (tiley < 0) tiley = c + tiley % c;
      if (tiley >= c) tiley = tiley % c;
    } else {
      if ((tilex < 0) || (tilex >= c) || (tiley < 0) || (tiley >= c)) {
        var blank = ownerDocument.createElement('DIV');
        blank.style.width = this.tileSize.width + 'px';
        blank.style.height = this.tileSize.height + 'px';
        return blank;
      }
    }

    var img = ownerDocument.createElement('img');

    img.id = "t_" + zoom + "_" + tilex + "_" + tiley;
    img.style.width = this.tileSize.width + 'px';
    img.style.height = this.tileSize.height + 'px';

    var canvas = ownerDocument.createElement('canvas');
    canvas.width = this.tileSize.width;
    canvas.height = this.tileSize.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(this.sourceImg, this.sourceImg.width / Math.pow(2, zoom) * tilex, this.sourceImg.height / Math.pow(2, zoom) * tiley, this.sourceImg.width / Math.pow(2, zoom), this.sourceImg.height / Math.pow(2, zoom), 0, 0, this.tileSize.width, this.tileSize.height);
    img.src = canvas.toDataURL();

    this.Cache.push(img);

    return img;
  };

  GMICMapType.prototype.realeaseTile = function(tile) {
    var idx = this.Cache.indexOf(tile);
    if (idx != -1) this.Cache.splice(idx, 1);
    tile = null;
  };

  GMICMapType.prototype.name = "Fantasy Map Generator";
  GMICMapType.prototype.alt = "Fantasy Map Generator";
  GMICMapType.prototype.setOpacity = function(newOpacity) {
    this.opacity = newOpacity;
    for (var i = 0; i < this.Cache.length; i++) {
      this.Cache[i].style.opacity = newOpacity;
      this.Cache[i].style.filter = "alpha(opacity=" + newOpacity * 100 + ")"; //ie
    }
  };

  getWindowHeight = function() {
    if (window.self && self.innerHeight) {
      return self.innerHeight;
    }
    if (document.documentElement && document.documentElement.clientHeight) {
      return document.documentElement.clientHeight;
    }
    return 0;
  };
})();

window.onload = function() {
  document.getElementById('start').addEventListener('change', onChangeHandler);
  document.getElementById('end').addEventListener('change', onChangeHandler);
}

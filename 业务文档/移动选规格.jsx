/**
 * 规格项数据源：
 * "[
 *      {
 *          "specificationId":"1163371333751040",
 *          "freeId":"free2",
 *          "specificationItem":
 *              [
 *                  {"name":"S","id":1163371333751041},
 *                  {"name":"M","id":1163371333751042},
 *                  {"name":"L","id":1163371333751043},
 *                  {"name":"长规格名字","id":1276358555685120}
 *              ],
 *           "specificationName":"零售尺码"
 *      },
 *      {
 *          "specificationId":"1163370840740096",
 *          "freeId":"free1",
 *          "specificationItem":
 *              [
 *                  {"name":"红","id":1163370840740097},
 *                  {"name":"橙","id":1163370840740098},
 *                  {"name":"黄","id":1163370840740099},
 *                  {"name":"规格名字特别长怎么办","id":1276357932536064}
 *              ],
 *          "specificationName":"零售颜色"
 *      }
 * ]"
 * 
 * 商品数据源：
 * "[
 *      {"productskus_primeCosts":0,"skuSalePrice":200,"free1":"红","free2":"S","skuName":"yh规格","skuCode":"yh020001","skuAbbreviation":"yh规格","productsku":1188514379043072,"product":1188513782370560,"fQuotePrice":200,"skuId":1188514379043072,
 *          "specIds":"1163371333751041;1163370840740097",
 *          "propertiesValue":"零售尺码:S;零售颜色:红;"},
 *      {"productskus_primeCosts":0,"skuSalePrice":200,"free1":"橙","free2":"S","skuName":"yh规格","skuCode":"yh020002","skuAbbreviation":"yh规格","productsku":1188514379043074,"product":1188513782370560,"fQuotePrice":200,"skuId":1188514379043074,"specIds":"1163371333751041;1163370840740098","propertiesValue":"零售尺码:S;零售颜色:橙;"},{"productskus_primeCosts":0,"skuSalePrice":200,"free1":"黄","free2":"S","skuName":"yh规格","skuCode":"yh020003","skuAbbreviation":"yh规格","productsku":1188514379059457,"product":1188513782370560,"fQuotePrice":200,"skuId":1188514379059457,"specIds":"1163371333751041;1163370840740099","propertiesValue":"零售尺码:S;零售颜色:黄;"},{"productskus_primeCosts":0,"skuSalePrice":200,"free1":"红","free2":"M","skuName":"yh规格","skuCode":"yh020004","skuAbbreviation":"yh规格","productsku":1188514379059459,"product":1188513782370560,"fQuotePrice":200,"skuId":1188514379059459,"specIds":"1163371333751042;1163370840740097","propertiesValue":"零售尺码:M;零售颜色:红;"},{"productskus_primeCosts":0,"skuSalePrice":200,"free1":"橙","free2":"M","skuName":"yh规格","skuCode":"yh020005","skuAbbreviation":"yh规格","productsku":1188514379059461,"product":1188513782370560,"fQuotePrice":200,"skuId":1188514379059461,"specIds":"1163371333751042;1163370840740098","propertiesValue":"零售尺码:M;零售颜色:橙;"},{"productskus_primeCosts":0,"skuSalePrice":200,"free1":"黄","free2":"M","skuName":"yh规格","skuCode":"yh020006","skuAbbreviation":"yh规格","productsku":1188514379059463,"product":1188513782370560,"fQuotePrice":200,"skuId":1188514379059463,"specIds":"1163371333751042;1163370840740099","propertiesValue":"零售尺码:M;零售颜色:黄;"},{"productskus_primeCosts":0,"skuSalePrice":200,"free1":"红","free2":"L","skuName":"yh规格","skuCode":"yh020007","skuAbbreviation":"yh规格","productsku":1188514379059465,"product":1188513782370560,"fQuotePrice":200,"skuId":1188514379059465,"specIds":"1163371333751043;1163370840740097","propertiesValue":"零售尺码:L;零售颜色:红;"},{"productskus_primeCosts":0,"skuSalePrice":200,"free1":"橙","free2":"L","skuName":"yh规格","skuCode":"yh020008","skuAbbreviation":"yh规格","productsku":1188514379059467,"product":1188513782370560,"fQuotePrice":200,"skuId":1188514379059467,"specIds":"1163371333751043;1163370840740098","propertiesValue":"零售尺码:L;零售颜色:橙;"},{"productskus_primeCosts":0,"skuSalePrice":200,"free1":"黄","free2":"L","skuName":"yh规格","skuCode":"yh020009","skuAbbreviation":"yh规格","productsku":1188514379059469,"product":1188513782370560,"fQuotePrice":200,"skuId":1188514379059469,"specIds":"1163371333751043;1163370840740099","propertiesValue":"零售尺码:L;零售颜色:黄;"},{"productskus_primeCosts":0,"skuSalePrice":200,"free1":"规格名字特别长怎么办","free2":"长规格名字","skuName":"yh规格-我的名称非常长一行显示不下不知道会显示多少行","skuCode":"yh020010","skuAbbreviation":"yh规格","productsku":1276360218284288,"product":1188513782370560,"fQuotePrice":200,"skuId":1276360218284288,"specIds":"1276358555685120;1276357932536064","propertiesValue":"零售尺码:长规格名字;零售颜色:规格名字特别长怎么办;"}]"
*/


/**
 * 构建skuKeyMap:
 * "{
 *      "1188513782370560&&1163371333751041":   //商品ID && 规格值id
 *          {                                   // 一个规格值对应的其他 规格项 里可选的规格值 集合
 *              "1163370840740096":              //规格项ID（specificationId） 具体规格项id对应的可选规格值集合
 *              [                             
 *                  {"name":"红","id":1163370840740097}, // 具体的规格值
 *                  {"name":"橙","id":1163370840740098},
 *                  {"name":"黄","id":1163370840740099},
 *                  {"name":"红","id":1163370840740097},
 *                  {"name":"橙","id":1163370840740098},
 *                  {"name":"黄","id":1163370840740099}
 *              ]
 *           },
 *      "1188513782370560&&1163371333751042":
 *          {"1163370840740096":
 *              [
 *                  {"name":"红","id":1163370840740097},
 *                  {"name":"橙","id":1163370840740098},
 *                  {"name":"黄","id":1163370840740099},
 *                  {"name":"红","id":1163370840740097},
 *                  {"name":"橙","id":1163370840740098},
 *                  {"name":"黄","id":1163370840740099}
 *              ]
 *          },
 *      "1188513782370560&&1163371333751043":
 *          {"1163370840740096":
 *              [
 *                  {"name":"红","id":1163370840740097},
 *                  {"name":"橙","id":1163370840740098},
 *                  {"name":"黄","id":1163370840740099},
 *                  {"name":"红","id":1163370840740097},
 *                  {"name":"橙","id":1163370840740098},{"name":"黄","id":1163370840740099}]},"1188513782370560&&1276358555685120":{"1163370840740096":[{"name":"规格名字特别长怎么办","id":1276357932536064},{"name":"规格名字特别长怎么办","id":1276357932536064}]},"1188513782370560&&1163370840740097":{"1163371333751040":[{"name":"S","id":1163371333751041},{"name":"M","id":1163371333751042},{"name":"L","id":1163371333751043},{"name":"S","id":1163371333751041},{"name":"M","id":1163371333751042},{"name":"L","id":1163371333751043}]},"1188513782370560&&1163370840740098":{"1163371333751040":[{"name":"S","id":1163371333751041},{"name":"M","id":1163371333751042},{"name":"L","id":1163371333751043},{"name":"S","id":1163371333751041},{"name":"M","id":1163371333751042},{"name":"L","id":1163371333751043}]},"1188513782370560&&1163370840740099":{"1163371333751040":[{"name":"S","id":1163371333751041},{"name":"M","id":1163371333751042},{"name":"L","id":1163371333751043},{"name":"S","id":1163371333751041},{"name":"M","id":1163371333751042},{"name":"L","id":1163371333751043}]},"1188513782370560&&1276357932536064":{"1163371333751040":[{"name":"长规格名字","id":1276358555685120},{"name":"长规格名字","id":1276358555685120}]}}"
*/


/**
 * 构建skuKeyMap
 * @param specItems 规格项数据源
 * @param  productId 商品id
 * @param  skus  商品数据源（sku数据源集合）
*/

const getSkuKeyMap = (specItems, productId, globalState) => {
    const { tableData } = globalState.goodsRefer.toJS();
    let skuSpecIds = []
    if (!tableData) return;
    let skus = null;
    for (var i = 0; i < tableData.length; i++) {
      if (tableData[i].product == productId) {
        skus = tableData[i].productskus;
        break;
      }
    }
    if (!skus) return;
    skus.map(sku=>{
      if (sku.specIds) {
        skuSpecIds.push(sku.specIds.split(';'))
      }
    })
    // 将sku里规格项的结合收集起来[["1163371333751041", "1163370840740097"], ["1163371333751041", "1163370840740098"]]
    if (!skuSpecIds.length) return
    specItems.forEach((item, index) => {
      let { specificationItem } = item;
      if (specificationItem && specificationItem.length) {
        specificationItem.forEach(spec => {
          let specId = spec.id+'';
          let key = `${productId}&&${specId}`
          if (!skuKeyMap[key]) skuKeyMap[key] = {};
          //找出当前spec对应的 规格项集合 映射到skuKeyMap中
          getBelongedSpec(index, specItems, key, skuSpecIds, specId)
        })
      }
    })
  }

  /**
   * @param index 当前规格项的下标（用来找出其他规格项）
   * @param specItems 规格项的数据源
   * @param key       skuKeyMap的key
   * @param skuSpecIds sku数据得到 规格值组合id 的集合
   * @param specId    当前规格值id
  */

  //去skus里去寻找specId, 找出适用于当前specId 的其他规格项以及规格值 的映射
  const getBelongedSpec = (index, specItems, key, skuSpecIds, specId) => {

    skuSpecIds.forEach(skuSpecId => {
      let specIndex = skuSpecId.indexOf(specId)
      // 规格项数据源中的某规格值id 在当前sku的skuIds是否存在， 存在再构建对应的 集合
      if (specIndex != -1) {
        let c_skuSepcId = cb.utils.extend(true, [], skuSpecId);
        c_skuSepcId.splice(specIndex, 1)
        // 在sku的规格值集合中 剔除主键specId的规格值，循环剩余规格值集合，找出剩余规格值集合都属于哪个规格项，
        // 最后将剩余规格值 归入其所属规格项中，并与主键key对应起来
        c_skuSepcId.forEach(ele=>{
          specItems.forEach((item, order)=>{
            if (order === index) return
            let { specificationItem, specificationId } = item;
            if (!specificationItem || !specificationItem.length) return
            specificationItem.forEach(spec=>{
              if(ele == spec.id+'') { // 说明sku剩余规格值 属于当前规格项，放入主键key对应的集合中（）
                if (!skuKeyMap[key][specificationId]) skuKeyMap[key][specificationId] = []
                skuKeyMap[key][specificationId].push(spec) // {165: [172] } / {165: [{id: 172, name: '红色'}]}
              }
            })
          })
        })
      }
    })
  }


  /**
   * 页面点击规格所触发的判断逻辑
  */
/**
 * @param product 点击的那个规格项  数据源
 * @param value   规格值id
 * @param specStringArr  页面展现所需要的规格项 与 规格值集合 的集合
 * @param original_specStringArr 规格项 与 规格值集合 的原始集合 （服务取回来的规格项数据源）
 * @param radioKey   当前选中的规格项与规格值
*/
 onRadioChange(product, value, specStringArr, entryPoint, original_specStringArr) {
    let { radioKey, checkedSpec, currentProduct } = this.props.goodsRefer;
    // radioKey: {1163371333751040: 1163371333751041}
    // 判断当前规格值有没有选中，选中的话去掉勾选，没有选中的话放入radioKey中
    if ((Object.values(radioKey).indexOf(value)) != -1) {
      delete radioKey[Number(product.specificationId)]
    } else {
      radioKey[product.specificationId] = value;
    }
    // 根据radioKey集合中的值作为过滤条件，过滤出最终需要在界面展现的middleSpecStringAr 也就是specStringArr
    // 此处用了递归传入过滤条件
    let middleSpecStringAr = original_specStringArr;
    Object.values(radioKey).forEach(value=>{
      middleSpecStringAr = this.getShowSpecArr(product.freeId, value, original_specStringArr, middleSpecStringAr, checkedSpec, currentProduct.product);
    })
    let length = Object.keys(radioKey).length;
    this.props.setOptions({ radioKey, "specStringArr": middleSpecStringAr, checkedSpec })
    if (specStringArr.length == length) {
      this.props.specOkBtnClick(entryPoint, product, true);
    }
  }


  // 找到对应的key，去skuKeyMap中去取对应应该显示的 规格值 的集合
  getShowSpecArr = (freeId, value, original_specStringArr, specStringArr, checkedSpec, productId) => {
    let skuKeyMap = getKeyMap();
    let key = `${productId}&&${value}`;
    let skuObj = skuKeyMap[key];
    let specArr = specStringArr;
    let currentSpecIndex = specArr.findIndex(item=>{
      let { specificationId, specificationItem } = item;
      let result = specificationItem.find(spec=>{
        return spec.id == value
      })
      return result
    })
    if (currentSpecIndex == -1) {
      cb.utils.alert('规格项选择出错！', 'error')
      return
    }
    specArr.forEach((item, index)=>{
      if (index != currentSpecIndex) {
        item.specificationItem = skuObj[item.specificationId]
      }
    })
    return specArr
  }
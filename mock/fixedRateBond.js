import Mock from 'mockjs'

const List = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    author: '@first',
    reviewer: '@pick(ROUND\(5/4, ROUND\(UP, ROUND\(DOWN, NO ROUND)',
    title: '@title(5, 10)',
    content_short: 'mock data',
    content: baseContent,
    forecast: '@float(0, 100, 2, 2)',
    importance: '@integer(1, 3)',
    'type|1': ['CN', 'US', 'JP', 'EU'],
    'status|1': ['published', 'draft'],
    display_time: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    image_uri,
    platforms: ['a-platform'],
    Id: '1',
    SecId: '@string(upper, 3)@string(number, 5)',
    LogicId: '@string(upper, 4)_@string(number, 4)',
    LogicVersion: '@interger(1,10)',
    Name: '@string(upper, 4) @pick(FIXED, FLOAT, ZERO, MBS, TIPS) @integer(1, 20)/@integer(1, 30)/@integer(1, 12) @string(upper, 4)',
    BondType: '@pick(FixedRate, FloatingRate, ZeroCoupon, MBS, IndexLinked)',
    CUSIP: '@string(upper, 9)',
    ISIN: '@string(upper, 2)@string(number,10)',
    BBID: '@string(number, 10)',
    IsAssetBacked: '@pick(Y, N)',
    CCY: '@pick(USD, JPN, EUR, AUD)',
    IssueDate: '@date(yyyy/MM/dd)',
    EffectiveDate: '@date(yyyy/MM/dd)',
    FirstCouponDate: '@date(yyyy/MM/dd)',
    PenultimateCouponDate: '@date(yyyy/MM/dd)',
    MaturityDate: '@date(yyyy/MM/dd)',
    MaturityDateRule: '@pick(Unadjusted, Adjusted)',
    CashFlowNonBusDayRule: '@pick(Following)',
    SettleOffset: '@integer(0, 7)',
    LastCoupon: '@float(0, 10, 2, 6)',
    Coupon: '@float(0, 10, 2, 6)',
    CouponFrequency: '@pick(Annual, SemiAnnual, Quarterly, Monthly)',
    CouponType: '@pick(EXACT)',
    EndOfMonth: '@pick(Y, N)',
    CouponDelay: '@integer(0, 7)',
    DayCountConvention: '@pick(30/360, 30E/360, ACTUAL/ACTUAL, ACTUAL/365, ACTUAL/360)',
    Basis: '@pick(LIBOR)',
    BasisFrequency: '@pick(3 MONTHS, 6 MONTHS)',
    Margin: '@float(0, 1, 4, 10)',
    BaseCPI: '@float(0, 10, 2, 8)',
    RateOffset: '@integer(0, 7)',
    InterestNonBusDayRule: '@pick(Following)',
    ExCouponDays: '@integer(0, 7)',
    ExCouponDayConv: '@pick(Following)',
    ExCouponEOM: '@pick(Y, N)',
    PriceRoundingMethod: '@pick(ROUND\(5/4, ROUND\(UP, ROUND\(DOWN, NO ROUND)',
    PriceRoudingPrecesion: '@integer(0, 12)',
    AccrueRoundingMethod: '@pick(ROUND\(5/4, ROUND\(UP, ROUND\(DOWN, NO ROUND)',
    AccrueRoudingPrecesion: '@integer(0, 12)',
    SettlementRoundingMethod: '@pick(ROUND\(5/4, ROUND\(UP, ROUND\(DOWN, NO ROUND)',
    SettlementRoudingPrecision: '@integer(0, 12)',
    QT_NAME: '@string(upper, 4) @pick(FIXED, FLOAT, ZERO, MBS, TIPS) @integer(1, 20)/@integer(1, 30)/@integer(1, 12) @string(upper, 4)',
    QT_THEKEY: '@string(number, 6)',
    QT_FORMULA: '@pick(FRN-CGL)',
    QT_SECTYPE: '@pick(COCO Floating)',
    QT_FIX_FLOAT: 'FLOATING'
  }))
}

export default [
  {
    url: '/vue-element-admin/fixedRateBonds/list',
    type: 'get',
    response: config => {
      const { Name, CCY, DayCountConvention, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (true && Name && item.Name !== Name) return false
        if (CCY && item.CCY !== CCY) return false
        if (DayCountConvention && item.DayCountConvention !== DayCountConvention) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/vue-element-admin/fixedRateBonds/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const article of List) {
        if (article.id === +id) {
          return {
            code: 20000,
            data: article
          }
        }
      }
    }
  },

  {
    url: '/vue-element-admin/fixedRateBonds/pv',
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: {
          pvData: [
            { key: 'PC', pv: 1024 },
            { key: 'mobile', pv: 1024 },
            { key: 'ios', pv: 1024 },
            { key: 'android', pv: 1024 }
          ]
        }
      }
    }
  },

  {
    url: '/vue-element-admin/fixedRateBonds/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-element-admin/fixedRateBonds/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]


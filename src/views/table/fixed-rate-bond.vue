<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.Name" :placeholder="$t('bond.Name')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.DayCountConvention" :placeholder="$t('bond.DayCountConvention')" clearable style="width: 185px" class="filter-item">
        <el-option v-for="item in dayCountConventionOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.CCY" :placeholder="$t('bond.CCY')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in CCYOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-upload" @click="handleImport">
        {{ $t('table.import') }}
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('bond.IsAssetBacked') }}
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column :label="$t('bond.Id')" prop="id" sortable="custom" align="center" width="60" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('bond.FirstCouponDate')" width="135px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.FirstCouponDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('bond.MaturityDate')" width="115px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.MaturityDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('bond.Name')" width="300px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetail(row)">{{ row.Name }}</span>
          <el-tag>{{ row.BondType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('bond.CUSIP')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.CUSIP }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('bond.ISIN')" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ISIN }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('bond.Coupon')" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Coupon }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('bond.CouponFrequency')" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.CouponFrequency }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" :label="$t('bond.IsAssetBacked')" width="110px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.IsAssetBacked }}</span>
        </template>
      </el-table-column>
      <!--   <el-table-column :label="$t('bond.Coupon')" align="center" width="95">
        <template slot-scope="{row}">
          <span v-if="row.pageviews" class="link-type" @click="handleFetchPv(row.pageviews)">{{ row.pageviews }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column> -->
      <el-table-column :label="$t('bond.CCY')" width="60px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.CCY }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('bond.DayCountConvention')" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.DayCountConvention }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogUploadFormVisible">
      <el-upload
        class="upload-demo"
        drag
        action="https://jsonplaceholder.typicode.com/posts/"
        multiple
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">Drag file to here<em>Click Upload</em></div>
        <div slot="tip" class="el-upload__tip">only .csv is allowed，and not bigger than 500KB</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogUploadFormVisible = false">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormDetailVisible" custom-class="bondCreateAndEditClass">
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.Name')" prop="Name">
          <span>{{ temp.Name }}</span>
        </el-form-item>
        <el-form-item :label="$t('bond.CCY')" prop="CCY" style="margin-left:100px">
          <span>{{ temp.CCY }}</span>
        </el-form-item>
        <el-form-item :label="$t('bond.DayCountConvention')" prop="DayCountConvention" style="margin-left:100px">
          <span>{{ temp.DayCountConvention }}</span>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.CUSIP')" prop="CUSIP">
          <span>{{ temp.CUSIP }}</span>
        </el-form-item>
        <el-form-item :label="$t('bond.ISIN')" prop="ISIN" style="margin-left:150px">
          <span>{{ temp.ISIN }}</span>
        </el-form-item>
        <el-form-item :label="$t('bond.BBID')" prop="BBID" style="margin-left:100px">
          <span>{{ temp.BBID }}</span>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.Coupon')" prop="Coupon">
          <span>{{ temp.Coupon }}</span>
        </el-form-item>
        <el-form-item :label="$t('bond.FirstCouponDate')" prop="FirstCouponDate" style="margin-left:60px">
          <span>{{ temp.FirstCouponDate }}</span>
        </el-form-item>
        <el-form-item :label="$t('bond.MaturityDate')" prop="MaturityDate" style="margin-left:150px">
          <span>{{ temp.MaturityDate }}</span>
        </el-form-item>
        <el-form-item :label="$t('bond.MaturityDateRule')" prop="MaturityDateRule" style="margin-left:60px">
          <span>{{ temp.MaturityDateRule }}</span>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.IssueDate')" prop="IssueDate">
          <el-date-picker v-model="temp.IssueDate" type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item :label="$t('bond.EffectiveDate')" prop="EffectiveDate">
          <el-date-picker v-model="temp.EffectiveDate" type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item :label="$t('bond.PenultimateCouponDate')" prop="PenultimateCouponDate">
          <el-date-picker v-model="temp.PenultimateCouponDate" type="date" placeholder="Please pick a date" />
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.SettleOffset')" prop="SettleOffset">
          <el-input v-model="temp.SettleOffset" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.CouponFrequency')" prop="CouponFrequency">
          <el-select v-model="temp.CouponFrequency" class="filter-item" placeholder="Please select">
            <el-option v-for="item in CouponFrequencyOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.CouponType')" prop="CouponType">
          <el-select v-model="temp.CouponType" class="filter-item" placeholder="Please select">
            <el-option v-for="item in CouponTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.CashFlowNonBusDayRule')" prop="CashFlowNonBusDayRule">
          <el-select v-model="temp.CashFlowNonBusDayRule" class="filter-item" placeholder="Please select">
            <el-option v-for="item in CashFlowNonBusDayRuleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.CouponDelay')" prop="CouponDelay">
          <el-input v-model="temp.CouponDelay" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.EndOfMonth')" prop="EndOfMonth">
          <el-select v-model="temp.EndOfMonth" class="filter-item" placeholder="Please select">
            <el-option v-for="item in EndOfMonthOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.InterestNonBusDayRule')" prop="InterestNonBusDayRule">
          <el-select v-model="temp.InterestNonBusDayRule" class="filter-item" placeholder="Please select">
            <el-option v-for="item in InterestNonBusDayRuleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.ExCouponDays')" prop="ExCouponDays">
          <el-input v-model="temp.ExCouponDays" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.ExCouponEOM')" prop="ExCouponEOM">
          <el-select v-model="temp.ExCouponEOM" class="filter-item" placeholder="Please select">
            <el-option v-for="item in ExCouponEOMOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.ExCouponDayConv')" prop="ExCouponDayConv">
          <el-select v-model="temp.ExCouponDayConv" class="filter-item" placeholder="Please select">
            <el-option v-for="item in ExCouponDayConvOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.PriceRoundingMethod')" prop="PriceRoundingMethod">
          <el-select v-model="temp.PriceRoundingMethod" class="filter-item" placeholder="Please select">
            <el-option v-for="item in PriceRoundingMethodOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.AccrueRoundingMethod')" prop="AccrueRoundingMethod">
          <el-select v-model="temp.AccrueRoundingMethod" class="filter-item" placeholder="Please select">
            <el-option v-for="item in AccrueRoundingMethodOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.SettlementRoundingMethod')" prop="SettlementRoundingMethod">
          <el-select v-model="temp.SettlementRoundingMethod" class="filter-item" placeholder="Please select">
            <el-option v-for="item in SettlementRoundingMethodOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.PriceRoudingPrecesion')" prop="PriceRoudingPrecesion">
          <el-input v-model="temp.PriceRoudingPrecesion" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.AccrueRoudingPrecesion')" prop="AccrueRoudingPrecesion">
          <el-input v-model="temp.AccrueRoudingPrecesion" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.SettlementRoudingPrecision')" prop="SettlementRoudingPrecision">
          <el-input v-model="temp.SettlementRoudingPrecision" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormDetailVisible = false">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" custom-class="bondCreateAndEditClass">
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.Name')" prop="Name">
          <el-input v-model="temp.Name" />
        </el-form-item>
        <el-form-item :label="$t('bond.CCY')" prop="CCY">
          <el-select v-model="temp.CCY" class="filter-item" placeholder="Please select">
            <el-option v-for="item in CCYOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.DayCountConvention')" prop="DayCountConvention">
          <el-select v-model="temp.DayCountConvention" class="filter-item" placeholder="Please select">
            <el-option v-for="item in dayCountConventionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.CUSIP')" prop="CUSIP">
          <el-input v-model="temp.CUSIP" />
        </el-form-item>
        <el-form-item :label="$t('bond.ISIN')" prop="ISIN">
          <el-input v-model="temp.ISIN" />
        </el-form-item>
        <el-form-item :label="$t('bond.BBID')" prop="BBID">
          <el-input v-model="temp.BBID" />
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.Coupon')" prop="Coupon">
          <el-input v-model="temp.Coupon" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.FirstCouponDate')" prop="FirstCouponDate">
          <el-date-picker v-model="temp.FirstCouponDate" type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item :label="$t('bond.MaturityDate')" prop="MaturityDate">
          <el-date-picker v-model="temp.MaturityDate" type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item :label="$t('bond.MaturityDateRule')" prop="MaturityDateRule">
          <el-select v-model="temp.MaturityDateRule" class="filter-item" placeholder="Please select">
            <el-option v-for="item in MaturityDateRuleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.IssueDate')" prop="IssueDate">
          <el-date-picker v-model="temp.IssueDate" type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item :label="$t('bond.EffectiveDate')" prop="EffectiveDate">
          <el-date-picker v-model="temp.EffectiveDate" type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item :label="$t('bond.PenultimateCouponDate')" prop="PenultimateCouponDate">
          <el-date-picker v-model="temp.PenultimateCouponDate" type="date" placeholder="Please pick a date" />
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.SettleOffset')" prop="SettleOffset">
          <el-input v-model="temp.SettleOffset" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.CouponFrequency')" prop="CouponFrequency">
          <el-select v-model="temp.CouponFrequency" class="filter-item" placeholder="Please select">
            <el-option v-for="item in CouponFrequencyOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.CouponType')" prop="CouponType">
          <el-select v-model="temp.CouponType" class="filter-item" placeholder="Please select">
            <el-option v-for="item in CouponTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.CashFlowNonBusDayRule')" prop="CashFlowNonBusDayRule">
          <el-select v-model="temp.CashFlowNonBusDayRule" class="filter-item" placeholder="Please select">
            <el-option v-for="item in CashFlowNonBusDayRuleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.CouponDelay')" prop="CouponDelay">
          <el-input v-model="temp.CouponDelay" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.EndOfMonth')" prop="EndOfMonth">
          <el-select v-model="temp.EndOfMonth" class="filter-item" placeholder="Please select">
            <el-option v-for="item in EndOfMonthOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.InterestNonBusDayRule')" prop="InterestNonBusDayRule">
          <el-select v-model="temp.InterestNonBusDayRule" class="filter-item" placeholder="Please select">
            <el-option v-for="item in InterestNonBusDayRuleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.ExCouponDays')" prop="ExCouponDays">
          <el-input v-model="temp.ExCouponDays" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.ExCouponEOM')" prop="ExCouponEOM">
          <el-select v-model="temp.ExCouponEOM" class="filter-item" placeholder="Please select">
            <el-option v-for="item in ExCouponEOMOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.ExCouponDayConv')" prop="ExCouponDayConv">
          <el-select v-model="temp.ExCouponDayConv" class="filter-item" placeholder="Please select">
            <el-option v-for="item in ExCouponDayConvOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.PriceRoundingMethod')" prop="PriceRoundingMethod">
          <el-select v-model="temp.PriceRoundingMethod" class="filter-item" placeholder="Please select">
            <el-option v-for="item in PriceRoundingMethodOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.AccrueRoundingMethod')" prop="AccrueRoundingMethod">
          <el-select v-model="temp.AccrueRoundingMethod" class="filter-item" placeholder="Please select">
            <el-option v-for="item in AccrueRoundingMethodOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bond.SettlementRoundingMethod')" prop="SettlementRoundingMethod">
          <el-select v-model="temp.SettlementRoundingMethod" class="filter-item" placeholder="Please select">
            <el-option v-for="item in SettlementRoundingMethodOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" label-position="left">
        <el-form-item :label="$t('bond.PriceRoudingPrecesion')" prop="PriceRoudingPrecesion">
          <el-input v-model="temp.PriceRoudingPrecesion" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.AccrueRoudingPrecesion')" prop="AccrueRoudingPrecesion">
          <el-input v-model="temp.AccrueRoudingPrecesion" type="number" />
        </el-form-item>
        <el-form-item :label="$t('bond.SettlementRoudingPrecision')" prop="SettlementRoudingPrecision">
          <el-input v-model="temp.SettlementRoudingPrecision" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/fixedRateBond'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const CCYOptions = [
  { key: 'USD', display_name: 'USD' },
  { key: 'EUR', display_name: 'EUR' },
  { key: 'JPN', display_name: 'JPN' },
  { key: 'AUS', display_name: 'AUS' }
]

const CCYKeyValue = CCYOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

// eslint-disable-next-line no-unused-vars
const dayCountConventionOptions = ['30/360', '30E/360', 'ACTUAL/ACTUAL', 'ACTUAL/365', 'ACTUAL/360']

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return CCYKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        Name: undefined,
        DayCountConvention: undefined,
        CCY: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      dayCountConventionOptions: ['30/360', '30E/360', 'ACTUAL/ACTUAL', 'ACTUAL/365', 'ACTUAL/360'],
      MaturityDateRuleOptions: ['Unadjusted', 'Adjusted'],
      CouponFrequencyOptions: ['Annual', 'SemiAnnual', 'Quarterly', 'Monthly'],
      CouponTypeOptions: ['EXACT'],
      CashFlowNonBusDayRuleOptions: ['Following'],
      InterestNonBusDayRuleOptions: ['Following'],
      EndOfMonthOptions: ['Y', 'N'],
      ExCouponEOMOptions: ['Y', 'N'],
      ExCouponDayConvOptions: ['Following'],
      PriceRoundingMethodOptions: ['ROUND(5/4)', 'ROUND(UP)', 'ROUND(DOWN)', 'NO ROUND'],
      AccrueRoundingMethodOptions: ['ROUND(5/4)', 'ROUND(UP)', 'ROUND(DOWN)', 'NO ROUND'],
      SettlementRoundingMethodOptions: ['ROUND(5/4)', 'ROUND(UP)', 'ROUND(DOWN)', 'NO ROUND'],
      CCYOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogUploadFormVisible: false,
      dialogFormDetailVisible: false,
      textMap: {
        update: 'Edit',
        create: 'Create',
        detail: 'Details',
        import: 'Import Bond From Bloomberg CSV'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 100)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleImport() {
      this.resetTemp()
      this.dialogStatus = 'import'
      this.dialogUploadFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDetail(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'detail'
      this.dialogFormDetailVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style>
  .bondCreateAndEditClass{
        width:90%;
  }
</style>

/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import { Scene } from "./scene";
import { VisualFormattingSettingsModel } from "./settings";
import { ProcessDataView } from "./tools/utils_process_data";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;

export class Visual implements IVisual {
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private scene: Scene;
    private animationFrameId: number;
    private resizeObserver: ResizeObserver;
    private processDataView: ProcessDataView;

    constructor(options: VisualConstructorOptions) {
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        this.scene = new Scene(this.target);

        // Initialize resize observer
        this.resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        this.resizeObserver.observe(this.target);

        // Start animation loop
        this.animate();
    }

    private handleResize(): void {
        const width = this.target.clientWidth;
        const height = this.target.clientHeight;
        this.scene.resize(width, height);
    }

    private animate(): void {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        this.scene.update();
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            options.dataViews
        );

        if (options.dataViews && options.dataViews[0]) {
            const dataView = options.dataViews[0];
            this.processDataView = new ProcessDataView();
            const new_com = this.processDataView.transfromDataToNodeAndElements(dataView)
            this.processData();
        }
    }

    private processData(): void {
        if (!this.processDataView) return;

        const nodes = this.processDataView.getNode();
        const elements = this.processDataView.getElement();
        const field_values = this.processDataView.getField();
        // Update the mesh with the processed data
        if (nodes && elements && this.scene) {
            this.scene.updateData({ nodes, elements, field_values });
        }
    }

    public destroy(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.scene) {
            this.scene.destroy();
        }
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}